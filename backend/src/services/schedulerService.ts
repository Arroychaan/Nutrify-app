import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

// Store active jobs to potentially stop them later
const activeJobs: cron.ScheduledTask[] = [];

/**
 * Initialize all scheduled tasks
 */
export const initializeSchedulers = () => {
  logger.info('Initializing schedulers...');

  // 1. Meal Reminders
  // Breakfast at 07:00
  scheduleMealReminder('0 7 * * *', 'Waktunya Sarapan! 🍳', 'Jangan lupa mengisi energi untuk memulai harimu.');

  // Lunch at 12:00
  scheduleMealReminder('0 12 * * *', 'Waktunya Makan Siang! 🥗', 'Istirahat sejenak dan nikmati makan siangmu.');

  // Dinner at 19:00
  scheduleMealReminder('0 19 * * *', 'Waktunya Makan Malam! 🍲', 'Makan malam sebelum larut baik untuk pencernaan.');

  // 2. Permanent Account Deletion
  schedulePermanentDeletion();

  logger.info(`Schedulers initialized. ${activeJobs.length} jobs running.`);
};

/**
 * Stop all scheduled tasks
 */
export const stopSchedulers = () => {
  activeJobs.forEach(job => job.stop());
  logger.info('All schedulers stopped.');
};

/**
 * Helper to schedule a meal reminder for all users who have reminders enabled
 */
const scheduleMealReminder = (cronExpression: string, title: string, message: string) => {
  const job = cron.schedule(cronExpression, async () => {
    logger.info(`Running scheduled task: ${title}`);

    try {
      // Find users who have meal reminders enabled
      // Note: In a real app with millions of users, we would batch this or use a queue.
      // For now, we fetch users with settings.
      const usersToNotify = await prisma.user.findMany({
        where: {
          notificationSettings: {
            mealReminders: true
          }
        },
        select: { id: true }
      });

      if (usersToNotify.length === 0) return;

      logger.info(`Sending "${title}" to ${usersToNotify.length} users.`);

      // Create notifications in batch
      await prisma.notification.createMany({
        data: usersToNotify.map(user => ({
          userId: user.id,
          title,
          message,
          type: 'REMINDER'
        }))
      });

    } catch (error) {
      logger.error(`Error in scheduled task ${title}:`, error);
    }
  });

  activeJobs.push(job);
};

/**
 * Schedule permanent deletion of soft-deleted accounts after 30 days
 */
const schedulePermanentDeletion = () => {
  // Run every day at midnight
  const job = cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled task: Permanent Account Deletion');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedUsers = await prisma.user.deleteMany({
        where: {
          deletedAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      if (deletedUsers.count > 0) {
        logger.info(`Permanently deleted ${deletedUsers.count} inactive accounts.`);
      }
    } catch (error) {
      logger.error('Error in Permanent Account Deletion task:', error);
    }
  });

  activeJobs.push(job);
};


