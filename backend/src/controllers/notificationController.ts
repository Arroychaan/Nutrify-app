import { Request, Response } from 'express';
import prisma from '@config/prisma.js';
import logger from '@config/logger.js';
import { sendNotificationToUser, NotificationPayload } from '@services/notificationService.js';
import { getSchedulerStatus } from '@services/schedulerService.js';

/**
 * Subscribe to push notifications
 * POST /api/v1/notifications/subscribe
 */
export async function subscribePush(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { endpoint, keys, platform, browser } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid push subscription data' },
      });
    }

    // Upsert subscription (update if endpoint exists, create if not)
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        platform: platform || null,
        browser: browser || null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        platform: platform || null,
        browser: browser || null,
      },
    });

    // Also create default notification settings if not exists
    await prisma.notificationSettings.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        mealReminders: true,
        streakReminders: true,
        goalProgress: true,
        dailyTips: true,
        weeklyReport: true,
        breakfastTime: '07:00',
        lunchTime: '12:00',
        dinnerTime: '19:00',
      },
    });

    logger.info('Push subscription created/updated', {
      userId,
      subscriptionId: subscription.id,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: subscription.id,
        message: 'Successfully subscribed to push notifications',
      },
    });
  } catch (error) {
    logger.error('Error subscribing to push notifications', { error });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to subscribe to push notifications' },
    });
  }
}

/**
 * Unsubscribe from push notifications
 * DELETE /api/v1/notifications/subscribe
 */
export async function unsubscribePush(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: { message: 'Endpoint is required' },
      });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });

    logger.info('Push subscription deleted', { userId, endpoint });

    return res.json({
      success: true,
      data: { message: 'Successfully unsubscribed from push notifications' },
    });
  } catch (error) {
    logger.error('Error unsubscribing from push notifications', { error });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to unsubscribe' },
    });
  }
}

/**
 * Get notification settings
 * GET /api/v1/notifications/settings
 */
export async function getNotificationSettings(req: Request, res: Response) {
  try {
    const userId = req.userId!;

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId,
          mealReminders: true,
          streakReminders: true,
          goalProgress: true,
          dailyTips: true,
          weeklyReport: true,
          breakfastTime: '07:00',
          lunchTime: '12:00',
          dinnerTime: '19:00',
        },
      });
    }

    // Get push subscription status
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
      select: { id: true, platform: true, browser: true, createdAt: true },
    });

    return res.json({
      success: true,
      data: {
        settings: {
          mealReminders: settings.mealReminders,
          streakReminders: settings.streakReminders,
          goalProgress: settings.goalProgress,
          dailyTips: settings.dailyTips,
          weeklyReport: settings.weeklyReport,
          breakfastTime: settings.breakfastTime,
          lunchTime: settings.lunchTime,
          dinnerTime: settings.dinnerTime,
        },
        subscriptions: subscriptions.map((s) => ({
          id: s.id,
          platform: s.platform,
          browser: s.browser,
          createdAt: s.createdAt,
        })),
        pushEnabled: subscriptions.length > 0,
      },
    });
  } catch (error) {
    logger.error('Error getting notification settings', { error });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to get notification settings' },
    });
  }
}

/**
 * Update notification settings
 * PUT /api/v1/notifications/settings
 */
export async function updateNotificationSettings(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const {
      mealReminders,
      streakReminders,
      goalProgress,
      dailyTips,
      weeklyReport,
      breakfastTime,
      lunchTime,
      dinnerTime,
    } = req.body;

    // Validate time format (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (breakfastTime && !timeRegex.test(breakfastTime)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid breakfast time format. Use HH:mm' },
      });
    }
    if (lunchTime && !timeRegex.test(lunchTime)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid lunch time format. Use HH:mm' },
      });
    }
    if (dinnerTime && !timeRegex.test(dinnerTime)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid dinner time format. Use HH:mm' },
      });
    }

    const settings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        ...(mealReminders !== undefined && { mealReminders }),
        ...(streakReminders !== undefined && { streakReminders }),
        ...(goalProgress !== undefined && { goalProgress }),
        ...(dailyTips !== undefined && { dailyTips }),
        ...(weeklyReport !== undefined && { weeklyReport }),
        ...(breakfastTime && { breakfastTime }),
        ...(lunchTime && { lunchTime }),
        ...(dinnerTime && { dinnerTime }),
      },
      create: {
        userId,
        mealReminders: mealReminders ?? true,
        streakReminders: streakReminders ?? true,
        goalProgress: goalProgress ?? true,
        dailyTips: dailyTips ?? true,
        weeklyReport: weeklyReport ?? true,
        breakfastTime: breakfastTime || '07:00',
        lunchTime: lunchTime || '12:00',
        dinnerTime: dinnerTime || '19:00',
      },
    });

    logger.info('Notification settings updated', { userId });

    return res.json({
      success: true,
      data: {
        mealReminders: settings.mealReminders,
        streakReminders: settings.streakReminders,
        goalProgress: settings.goalProgress,
        dailyTips: settings.dailyTips,
        weeklyReport: settings.weeklyReport,
        breakfastTime: settings.breakfastTime,
        lunchTime: settings.lunchTime,
        dinnerTime: settings.dinnerTime,
      },
    });
  } catch (error) {
    logger.error('Error updating notification settings', { error });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update notification settings' },
    });
  }
}

/**
 * Get notification history
 * GET /api/v1/notifications/history
 */
export async function getNotificationHistory(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { limit = 20, offset = 0 } = req.query;

    const notifications = await prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.notificationLog.count({
      where: { userId },
    });

    return res.json({
      success: true,
      data: {
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          sentAt: n.sentAt,
          delivered: n.successCount > 0,
        })),
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting notification history', { error });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to get notification history' },
    });
  }
}

/**
 * Send test notification (for debugging)
 * POST /api/v1/notifications/test
 */
export async function sendTestNotification(req: Request, res: Response) {
  try {
    const userId = req.userId!;

    const payload: NotificationPayload = {
      title: '🎉 Test Notification',
      body: 'Jika kamu melihat ini, notifikasi berfungsi dengan baik!',
      icon: '/icons/icon-192x192.png',
      tag: 'test-notification',
      data: {
        type: 'test',
        url: '/dashboard',
      },
    };

    const result = await sendNotificationToUser(userId, payload);

    return res.json({
      success: true,
      data: {
        message: 'Test notification sent',
        delivered: result.success,
        failed: result.failed,
      },
    });
  } catch (error) {
    logger.error('Error sending test notification', { error });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to send test notification' },
    });
  }
}

/**
 * Get VAPID public key for client-side subscription
 * GET /api/v1/notifications/vapid-key
 */
export async function getVapidPublicKey(req: Request, res: Response) {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';

  if (!vapidPublicKey) {
    return res.status(500).json({
      success: false,
      error: { message: 'VAPID public key not configured' },
    });
  }

  return res.json({
    success: true,
    data: { publicKey: vapidPublicKey },
  });
}

/**
 * Get scheduler status (admin only, for debugging)
 * GET /api/v1/notifications/scheduler-status
 */
export async function getSchedulerStatusHandler(req: Request, res: Response) {
  try {
    const status = getSchedulerStatus();

    return res.json({
      success: true,
      data: { schedulers: status },
    });
  } catch (error) {
    logger.error('Error getting scheduler status', { error });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to get scheduler status' },
    });
  }
}
