import cron from 'node-cron';
import prisma from '@config/prisma.js';
import logger from '@config/logger.js';
import {
  sendMealReminder,
  sendStreakReminder,
  sendDailyTip,
  sendWeeklySummary,
} from './notificationService.js';

/**
 * Scheduler Service
 * Manages all scheduled tasks for notifications
 */

// Store active cron jobs
const activeJobs: Map<string, cron.ScheduledTask> = new Map();

/**
 * Get users who need meal reminders at a specific time
 */
async function getUsersForMealReminder(
  mealType: 'breakfast' | 'lunch' | 'dinner',
  currentTime: string
): Promise<string[]> {
  const timeField =
    mealType === 'breakfast'
      ? 'breakfastTime'
      : mealType === 'lunch'
      ? 'lunchTime'
      : 'dinnerTime';

  const settings = await prisma.notificationSettings.findMany({
    where: {
      mealReminders: true,
      [timeField]: currentTime,
    },
    select: { userId: true },
  });

  return settings.map((s) => s.userId);
}

/**
 * Process meal reminders for a specific meal type
 */
async function processMealReminders(
  mealType: 'breakfast' | 'lunch' | 'dinner'
): Promise<void> {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  logger.info(`Processing ${mealType} reminders for time ${currentTime}`);

  try {
    const userIds = await getUsersForMealReminder(mealType, currentTime);

    logger.info(`Found ${userIds.length} users for ${mealType} reminder`);

    for (const userId of userIds) {
      try {
        await sendMealReminder(userId, mealType);
      } catch (error) {
        logger.error(`Failed to send ${mealType} reminder to user`, {
          userId,
          error,
        });
      }
    }
  } catch (error) {
    logger.error(`Error processing ${mealType} reminders`, { error });
  }
}

/**
 * Process streak reminders - runs at 20:00 daily
 */
async function processStreakReminders(): Promise<void> {
  logger.info('Processing streak reminders');

  try {
    // Get users with streak reminders enabled who haven't logged food today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersWithReminders = await prisma.notificationSettings.findMany({
      where: { streakReminders: true },
      include: {
        user: {
          select: {
            id: true,
            streakDays: true,
            foodLogs: {
              where: {
                loggedAt: { gte: today },
              },
              take: 1,
            },
          },
        },
      },
    });

    // Filter users who haven't logged food today
    const usersToNotify = usersWithReminders.filter(
      (setting) => setting.user.foodLogs.length === 0
    );

    logger.info(`Found ${usersToNotify.length} users for streak reminder`);

    for (const setting of usersToNotify) {
      try {
        await sendStreakReminder(setting.userId, setting.user.streakDays);
      } catch (error) {
        logger.error('Failed to send streak reminder', {
          userId: setting.userId,
          error,
        });
      }
    }
  } catch (error) {
    logger.error('Error processing streak reminders', { error });
  }
}

/**
 * Process daily tips - runs at 09:00 daily
 */
async function processDailyTips(): Promise<void> {
  logger.info('Processing daily tips');

  try {
    const usersWithTips = await prisma.notificationSettings.findMany({
      where: { dailyTips: true },
      select: { userId: true },
    });

    logger.info(`Sending daily tips to ${usersWithTips.length} users`);

    for (const setting of usersWithTips) {
      try {
        await sendDailyTip(setting.userId);
      } catch (error) {
        logger.error('Failed to send daily tip', {
          userId: setting.userId,
          error,
        });
      }
    }
  } catch (error) {
    logger.error('Error processing daily tips', { error });
  }
}

/**
 * Process weekly summaries - runs every Sunday at 10:00
 */
async function processWeeklySummaries(): Promise<void> {
  logger.info('Processing weekly summaries');

  try {
    const usersWithWeeklyReport = await prisma.notificationSettings.findMany({
      where: { weeklyReport: true },
      include: {
        user: {
          select: {
            id: true,
            streakDays: true,
            currentWeightKg: true,
            heightCm: true,
            activityLevel: true,
            gender: true,
            dateOfBirth: true,
          },
        },
      },
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const setting of usersWithWeeklyReport) {
      try {
        // Get food logs for the past week
        const foodLogs = await prisma.foodLog.findMany({
          where: {
            userId: setting.userId,
            loggedAt: { gte: oneWeekAgo },
          },
        });

        // Calculate stats
        const totalCalories = foodLogs.reduce(
          (sum, log) => sum + (Number(log.calories) || 0),
          0
        );
        const daysWithLogs = new Set(
          foodLogs.map((log) => log.loggedAt.toDateString())
        ).size;
        const avgCalories = daysWithLogs > 0 ? Math.round(totalCalories / daysWithLogs) : 0;

        // Calculate target calories (simplified)
        const targetCalories = 2000; // TODO: Use actual calculated target

        await sendWeeklySummary(setting.userId, {
          avgCalories,
          targetCalories,
          mealsLogged: foodLogs.length,
          streakDays: setting.user.streakDays,
        });
      } catch (error) {
        logger.error('Failed to send weekly summary', {
          userId: setting.userId,
          error,
        });
      }
    }
  } catch (error) {
    logger.error('Error processing weekly summaries', { error });
  }
}

/**
 * Initialize all schedulers
 */
export function initializeSchedulers(): void {
  logger.info('Initializing notification schedulers');

  // Meal reminder scheduler - runs every minute to check for users
  // This checks every minute and compares with user's preferred times
  const mealReminderJob = cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    
    // Only process at the start of each minute
    if (currentMinute % 1 === 0) {
      await processMealReminders('breakfast');
      await processMealReminders('lunch');
      await processMealReminders('dinner');
    }
  });
  activeJobs.set('meal-reminders', mealReminderJob);

  // Streak reminder - every day at 20:00
  const streakReminderJob = cron.schedule('0 20 * * *', processStreakReminders);
  activeJobs.set('streak-reminders', streakReminderJob);

  // Daily tips - every day at 09:00
  const dailyTipsJob = cron.schedule('0 9 * * *', processDailyTips);
  activeJobs.set('daily-tips', dailyTipsJob);

  // Weekly summary - every Sunday at 10:00
  const weeklySummaryJob = cron.schedule('0 10 * * 0', processWeeklySummaries);
  activeJobs.set('weekly-summary', weeklySummaryJob);

  logger.info('All notification schedulers initialized', {
    jobs: Array.from(activeJobs.keys()),
  });
}

/**
 * Stop all schedulers
 */
export function stopSchedulers(): void {
  logger.info('Stopping notification schedulers');

  for (const [name, job] of activeJobs) {
    job.stop();
    logger.debug(`Stopped scheduler: ${name}`);
  }

  activeJobs.clear();
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): { name: string; running: boolean }[] {
  return Array.from(activeJobs.entries()).map(([name, _job]) => ({
    name,
    running: true, // If job exists in activeJobs, it's running
  }));
}

export default {
  initializeSchedulers,
  stopSchedulers,
  getSchedulerStatus,
};
