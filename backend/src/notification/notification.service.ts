import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema.js';
import {
  pushSubscriptions,
  notificationLogs,
  notifications,
  notificationSettings,
  users,
} from '../db/schema.js';
import { eq, and, desc, count } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import webpush from 'web-push';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
    private configService: ConfigService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {
    const vapidPublicKey =
      this.configService.get<string>('VAPID_PUBLIC_KEY') || '';
    const vapidPrivateKey =
      this.configService.get<string>('VAPID_PRIVATE_KEY') || '';

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(
        'mailto:support@aiate.app',
        vapidPublicKey,
        vapidPrivateKey,
      );
      this.logger.log('VAPID keys set successfully for webpush');
    } else {
      this.logger.warn(
        'VAPID keys not configured. Push notifications will fail.',
      );
    }
  }

  async onModuleInit() {
    try {
      this.logger.log(
        'Initializing notification queues and repeatable jobs...',
      );

      // Clean up old repeatable jobs to avoid duplicates on restarts
      const repeatableJobs = await this.notificationQueue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        await this.notificationQueue.removeRepeatableByKey(job.key);
      }

      // Schedule Meal Reminders (Cron expression matching old schedulerService)
      await this.notificationQueue.add(
        'meal-reminder',
        {
          mealType: 'breakfast',
          title: 'Waktunya Sarapan! 🍳',
          body: 'Jangan lupa mengisi energi untuk memulai harimu.',
        },
        { repeat: { pattern: '0 7 * * *' } },
      );

      await this.notificationQueue.add(
        'meal-reminder',
        {
          mealType: 'lunch',
          title: 'Waktunya Makan Siang! 🥗',
          body: 'Istirahat sejenak dan nikmati makan siangmu.',
        },
        { repeat: { pattern: '0 12 * * *' } },
      );

      await this.notificationQueue.add(
        'meal-reminder',
        {
          mealType: 'dinner',
          title: 'Waktunya Makan Malam! 🍲',
          body: 'Makan malam sebelum larut baik untuk pencernaan.',
        },
        { repeat: { pattern: '0 19 * * *' } },
      );

      // Schedule Permanent Account Deletion every day at midnight
      await this.notificationQueue.add(
        'permanent-account-deletion',
        {},
        { repeat: { pattern: '0 0 * * *' } },
      );

      this.logger.log('Notification repeatable jobs scheduled successfully');
    } catch (err) {
      this.logger.warn(
        'Could not register BullMQ repeatable jobs. This is expected if Redis is not running in development mode.',
      );
    }
  }

  async getVapidKey() {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY') || '';
    if (!publicKey) {
      throw new BadRequestException('VAPID keys not configured on server');
    }
    return { publicKey };
  }

  async subscribePush(userId: string, body: any) {
    const { endpoint, keys, platform, browser } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw new BadRequestException(
        'Invalid subscription data: endpoint and keys are required',
      );
    }

    const [existing] = await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    if (existing) {
      await this.db
        .update(pushSubscriptions)
        .set({
          userId,
          p256dh: keys.p256dh,
          auth: keys.auth,
          platform: platform || 'web',
          browser: browser || 'unknown',
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.id, existing.id));
    } else {
      await this.db.insert(pushSubscriptions).values({
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        platform: platform || 'web',
        browser: browser || 'unknown',
      });
    }

    return { message: 'Successfully subscribed to push notifications' };
  }

  async unsubscribePush(userId: string, body: any) {
    const { endpoint } = body;

    if (!endpoint) {
      throw new BadRequestException('Endpoint is required');
    }

    await this.db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.endpoint, endpoint),
          eq(pushSubscriptions.userId, userId),
        ),
      );

    return { message: 'Successfully unsubscribed from push notifications' };
  }

  async getNotifications(userId: string, query: any) {
    const { limit = '20', unreadOnly = 'false' } = query;
    const limitNum = parseInt(limit as string, 10) || 20;

    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly === 'true') {
      conditions.push(eq(notifications.isRead, false));
    }

    const items = await this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limitNum);

    const [countResult] = await this.db
      .select({ total: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );

    const unreadCount = countResult?.total || 0;

    return {
      notifications: items,
      unreadCount,
    };
  }

  async markAsRead(userId: string, id: string) {
    const [existing] = await this.db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Notification not found');
    }

    await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );

    return { message: 'All notifications marked as read' };
  }

  async getSettings(userId: string) {
    let [settings] = await this.db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1);

    if (!settings) {
      [settings] = await this.db
        .insert(notificationSettings)
        .values({
          userId,
          mealReminders: true,
          streakReminders: true,
          goalProgress: true,
          dailyTips: true,
          weeklyReport: true,
          breakfastTime: '07:00',
          lunchTime: '12:00',
          dinnerTime: '19:00',
        })
        .returning();
    }

    return settings;
  }

  async updateSettings(userId: string, body: any) {
    const {
      mealReminders,
      streakReminders,
      goalProgress,
      dailyTips,
      weeklyReport,
      breakfastTime,
      lunchTime,
      dinnerTime,
    } = body;

    const [existing] = await this.db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1);

    let settings;
    if (existing) {
      [settings] = await this.db
        .update(notificationSettings)
        .set({
          mealReminders: mealReminders ?? existing.mealReminders,
          streakReminders: streakReminders ?? existing.streakReminders,
          goalProgress: goalProgress ?? existing.goalProgress,
          dailyTips: dailyTips ?? existing.dailyTips,
          weeklyReport: weeklyReport ?? existing.weeklyReport,
          breakfastTime: breakfastTime ?? existing.breakfastTime,
          lunchTime: lunchTime ?? existing.lunchTime,
          dinnerTime: dinnerTime ?? existing.dinnerTime,
        })
        .where(eq(notificationSettings.userId, userId))
        .returning();
    } else {
      [settings] = await this.db
        .insert(notificationSettings)
        .values({
          userId,
          mealReminders: mealReminders ?? true,
          streakReminders: streakReminders ?? true,
          goalProgress: goalProgress ?? true,
          dailyTips: dailyTips ?? true,
          weeklyReport: weeklyReport ?? true,
          breakfastTime: breakfastTime ?? '07:00',
          lunchTime: lunchTime ?? '12:00',
          dinnerTime: dinnerTime ?? '19:00',
        })
        .returning();
    }

    return settings;
  }

  async sendNotificationToUser(userId: string, payload: NotificationPayload) {
    try {
      const subs = await this.db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));

      if (subs.length === 0) {
        return { success: 0, failed: 0 };
      }

      let successCount = 0;
      let failedCount = 0;

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            JSON.stringify(payload),
          );
          successCount++;
        } catch (error: any) {
          failedCount++;
          this.logger.error(
            `Failed to send push notification to user ${userId}: ${error.message}`,
          );

          if (error.statusCode === 404 || error.statusCode === 410) {
            await this.db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, sub.id));
            this.logger.log(
              `Removed invalid push subscription for user ${userId}`,
            );
          }
        }
      }

      await this.db.insert(notificationLogs).values({
        userId,
        type: payload.data?.type || 'general',
        title: payload.title,
        body: payload.body,
        successCount,
        failedCount,
      });

      return { success: successCount, failed: failedCount };
    } catch (error) {
      this.logger.error('Error sending notification to user:', error);
      throw error;
    }
  }

  async sendMealReminder(
    userId: string,
    mealType: 'breakfast' | 'lunch' | 'dinner',
  ) {
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

    await this.sendNotificationToUser(userId, payload);
  }

  async sendStreakReminder(userId: string, currentStreak: number) {
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

    await this.sendNotificationToUser(userId, payload);
  }

  async sendDailyTip(userId: string) {
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

    await this.sendNotificationToUser(userId, payload);
  }

  async sendWeeklySummary(userId: string, stats: any) {
    const percentage = Math.round(
      (stats.avgCalories / stats.targetCalories) * 100,
    );
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

    await this.sendNotificationToUser(userId, payload);
  }

  async sendBadgeEarned(
    userId: string,
    badgeName: string,
    badgeDescription: string,
  ) {
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

    await this.sendNotificationToUser(userId, payload);
  }

  async sendGoalProgress(
    userId: string,
    goalType: string,
    progress: number,
    target: number,
  ) {
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

    await this.sendNotificationToUser(userId, payload);
  }

  async sendOvereatingWarning(
    userId: string,
    currentCalories: number,
    limitCalories: number,
    mealName: string,
  ) {
    const diff = currentCalories - limitCalories;

    const payload: NotificationPayload = {
      title: '⚠️ Calorie Alert!',
      body: `Kamu telah melewati batas kalori harian sebesar ${diff} kkal setelah makan ${mealName}. Jaga asupanmu ya!`,
      icon: '/icons/icon-192x192.png',
      tag: 'overeating-warning',
      data: {
        type: 'overeating_warning',
        currentCalories,
        limitCalories,
        url: '/dashboard',
      },
      actions: [
        { action: 'view-log', title: 'Lihat Log' },
        { action: 'get-advice', title: 'Saran AI' },
      ],
    };

    await this.sendNotificationToUser(userId, payload);
  }
}
