import webpush from 'web-push';
import prisma from '@config/prisma.js';
import logger from '@config/logger.js';
import config from '@config/index.js';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:support@nutrify.app',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    type: string;
    url?: string;
    [key: string]: any;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Send push notification to a specific user
 */
export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
): Promise<{ success: number; failed: number }> {
  try {
    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      logger.debug('No push subscriptions found for user', { userId });
      return { success: 0, failed: 0 };
    }

    let successCount = 0;
    let failedCount = 0;

    // Send to all user's devices
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload)
        );
        successCount++;
      } catch (error: any) {
        failedCount++;
        logger.error('Failed to send push notification', {
          userId,
          endpoint: subscription.endpoint,
          error: error.message,
        });

        // Remove invalid subscriptions (expired or unsubscribed)
        if (error.statusCode === 404 || error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: subscription.id },
          });
          logger.info('Removed invalid push subscription', {
            subscriptionId: subscription.id,
          });
        }
      }
    }

    // Log the notification
    await prisma.notificationLog.create({
      data: {
        userId,
        type: payload.data?.type || 'general',
        title: payload.title,
        body: payload.body,
        successCount,
        failedCount,
      },
    });

    return { success: successCount, failed: failedCount };
  } catch (error) {
    logger.error('Error sending notification to user', { userId, error });
    throw error;
  }
}

/**
 * Send meal reminder notification
 */
export async function sendMealReminder(
  userId: string,
  mealType: 'breakfast' | 'lunch' | 'dinner'
): Promise<void> {
  const mealNames: Record<string, string> = {
    breakfast: 'sarapan',
    lunch: 'makan siang',
    dinner: 'makan malam',
  };

  const mealEmojis: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
  };

  const payload: NotificationPayload = {
    title: `Waktunya ${mealNames[mealType]}! ${mealEmojis[mealType]}`,
    body: `Jangan lupa catat makananmu untuk tracking nutrisi yang lebih akurat.`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: `meal-reminder-${mealType}`,
    data: {
      type: 'meal_reminder',
      mealType,
      url: '/dashboard',
    },
    actions: [
      { action: 'log-food', title: 'Catat Makanan' },
      { action: 'view-plan', title: 'Lihat Menu' },
    ],
  };

  await sendNotificationToUser(userId, payload);
}

/**
 * Send streak reminder notification
 */
export async function sendStreakReminder(
  userId: string,
  currentStreak: number
): Promise<void> {
  let message = '';
  let emoji = '🔥';

  if (currentStreak === 0) {
    message = 'Mulai streak baru hari ini! Log makananmu untuk memulai.';
    emoji = '💪';
  } else if (currentStreak < 7) {
    message = `Streak ${currentStreak} hari! Jangan sampai putus, log makananmu hari ini.`;
  } else if (currentStreak < 30) {
    message = `WOW! Streak ${currentStreak} hari! Kamu luar biasa, terus pertahankan! 🏆`;
  } else {
    message = `AMAZING! Streak ${currentStreak} hari! Kamu adalah inspirasi! 👑`;
    emoji = '👑';
  }

  const payload: NotificationPayload = {
    title: `${emoji} Streak Reminder`,
    body: message,
    icon: '/icons/icon-192x192.png',
    tag: 'streak-reminder',
    data: {
      type: 'streak_reminder',
      currentStreak,
      url: '/dashboard',
    },
  };

  await sendNotificationToUser(userId, payload);
}

/**
 * Send daily tip notification
 */
export async function sendDailyTip(userId: string): Promise<void> {
  const tips = [
    'Minum minimal 8 gelas air putih sehari untuk menjaga metabolisme tubuh! 💧',
    'Konsumsi sayuran hijau minimal 3 porsi sehari untuk memenuhi kebutuhan serat. 🥬',
    'Sarapan yang baik membantu konsentrasi dan energi sepanjang hari! 🌅',
    'Kurangi garam untuk menjaga tekanan darah tetap normal. 🧂',
    'Olahraga 30 menit sehari dapat meningkatkan mood dan kesehatan! 🏃',
    'Tidur cukup 7-8 jam membantu metabolisme dan pemulihan tubuh. 😴',
    'Pilih karbohidrat kompleks seperti nasi merah daripada nasi putih. 🍚',
    'Protein dari ikan lebih sehat daripada daging merah. 🐟',
    'Hindari makan 2-3 jam sebelum tidur untuk pencernaan yang lebih baik. 🌙',
    'Makanan lokal Indonesia kaya nutrisi dan lebih terjangkau! 🇮🇩',
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  const payload: NotificationPayload = {
    title: '💡 Tips Nutrisi Hari Ini',
    body: randomTip,
    icon: '/icons/icon-192x192.png',
    tag: 'daily-tip',
    data: {
      type: 'daily_tip',
      url: '/dashboard',
    },
  };

  await sendNotificationToUser(userId, payload);
}

/**
 * Send weekly summary notification
 */
export async function sendWeeklySummary(
  userId: string,
  stats: {
    avgCalories: number;
    targetCalories: number;
    mealsLogged: number;
    streakDays: number;
  }
): Promise<void> {
  const percentage = Math.round((stats.avgCalories / stats.targetCalories) * 100);
  let message = '';

  if (percentage >= 90 && percentage <= 110) {
    message = `Minggu ini kamu rata-rata konsumsi ${stats.avgCalories} kkal (${percentage}% dari target). Excellent! 🎯`;
  } else if (percentage < 90) {
    message = `Minggu ini rata-rata ${stats.avgCalories} kkal (${percentage}% dari target). Coba tingkatkan asupanmu! 📈`;
  } else {
    message = `Minggu ini rata-rata ${stats.avgCalories} kkal (${percentage}% dari target). Coba kurangi sedikit ya! 📉`;
  }

  const payload: NotificationPayload = {
    title: '📊 Laporan Mingguanmu',
    body: message,
    icon: '/icons/icon-192x192.png',
    tag: 'weekly-summary',
    data: {
      type: 'weekly_summary',
      stats,
      url: '/dashboard',
    },
    actions: [{ action: 'view-stats', title: 'Lihat Detail' }],
  };

  await sendNotificationToUser(userId, payload);
}

/**
 * Send badge earned notification
 */
export async function sendBadgeEarned(
  userId: string,
  badgeName: string,
  badgeDescription: string
): Promise<void> {
  const payload: NotificationPayload = {
    title: '🏆 Badge Baru Diraih!',
    body: `Selamat! Kamu mendapatkan badge "${badgeName}": ${badgeDescription}`,
    icon: '/icons/icon-192x192.png',
    tag: 'badge-earned',
    data: {
      type: 'badge_earned',
      badgeName,
      url: '/dashboard/profile',
    },
  };

  await sendNotificationToUser(userId, payload);
}

/**
 * Send goal progress notification
 */
export async function sendGoalProgress(
  userId: string,
  goalType: string,
  progress: number,
  target: number
): Promise<void> {
  const percentage = Math.round((progress / target) * 100);
  let emoji = '📊';
  let message = '';

  if (percentage >= 100) {
    emoji = '🎉';
    message = `Target ${goalType} tercapai! ${progress}/${target}. Luar biasa!`;
  } else if (percentage >= 75) {
    emoji = '💪';
    message = `${percentage}% menuju target ${goalType}! Sedikit lagi!`;
  } else if (percentage >= 50) {
    emoji = '📈';
    message = `Sudah ${percentage}% dari target ${goalType}. Terus semangat!`;
  } else {
    message = `Progress ${goalType}: ${percentage}%. Ayo tingkatkan!`;
  }

  const payload: NotificationPayload = {
    title: `${emoji} Progress Update`,
    body: message,
    icon: '/icons/icon-192x192.png',
    tag: 'goal-progress',
    data: {
      type: 'goal_progress',
      goalType,
      progress,
      target,
      url: '/dashboard',
    },
  };

  await sendNotificationToUser(userId, payload);
}

export default {
  sendNotificationToUser,
  sendMealReminder,
  sendStreakReminder,
  sendDailyTip,
  sendWeeklySummary,
  sendBadgeEarned,
  sendGoalProgress,
};
