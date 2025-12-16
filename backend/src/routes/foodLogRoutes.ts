import { Router } from 'express';
import { authenticateToken } from '@middlewares/auth.js';
import {
  createFoodLog,
  getFoodLogsByDate,
  getFoodLogsSummary,
  deleteFoodLog,
  updateFoodLog,
  getTodaySummary,
  updateWaterLog,
  getWaterLog,
} from '../controllers/foodLogController.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/food-logs - Create new food log
router.post('/', createFoodLog);

// GET /api/food-logs - Get food logs by date
router.get('/', getFoodLogsByDate);

// GET /api/food-logs/summary - Get summary for date range
router.get('/summary', getFoodLogsSummary);

// GET /api/food-logs/today - Get today's calorie summary
router.get('/today', getTodaySummary);

// PUT /api/food-logs/water - Update water intake (Specific route BEFORE generic :id)
router.put('/water', updateWaterLog);

// GET /api/food-logs/water - Get water intake (Specific route BEFORE generic :id)
router.get('/water', getWaterLog);

// PUT /api/food-logs/:id - Update food log
router.put('/:id', updateFoodLog);

// DELETE /api/food-logs/:id - Delete food log
router.delete('/:id', deleteFoodLog);

export default router;
