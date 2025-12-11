import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.js';
import {
  subscribePush,
  unsubscribePush,
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationHistory,
  sendTestNotification,
  getVapidPublicKey,
  getSchedulerStatusHandler,
} from '@controllers/notificationController.js';

const router = Router();

// Public routes (no auth required)
router.get('/vapid-key', getVapidPublicKey);

// Protected routes (auth required)
router.use(authMiddleware);

// Push subscription management
router.post('/subscribe', subscribePush);
router.delete('/subscribe', unsubscribePush);

// Notification settings
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);

// Notification history
router.get('/history', getNotificationHistory);

// Test notification
router.post('/test', sendTestNotification);

// Scheduler status (for debugging)
router.get('/scheduler-status', getSchedulerStatusHandler);

export default router;
