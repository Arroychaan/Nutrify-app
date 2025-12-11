import { Router } from 'express';
import {
  searchFoods,
  getFoodById,
  getCategories,
  getFoodsByCategory,
  getNutritionBulk,
  getFoodSuggestions,
  getFoodStats,
  filterFoods,
} from '../controllers/foodController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.js';

const router = Router();

/**
 * Food Routes
 * Base path: /api/v1/foods
 */

// Public routes (no auth required for food lookup)
router.get('/search', optionalAuthMiddleware, searchFoods);
router.get('/categories', optionalAuthMiddleware, getCategories);
router.get('/stats', optionalAuthMiddleware, getFoodStats);
router.get('/suggestions', optionalAuthMiddleware, getFoodSuggestions);
router.get('/category/:category', optionalAuthMiddleware, getFoodsByCategory);
router.get('/:id', optionalAuthMiddleware, getFoodById);

// Protected routes (for personalized filtering)
router.post('/nutrition', authMiddleware, getNutritionBulk);
router.post('/filter', authMiddleware, filterFoods);

export default router;
