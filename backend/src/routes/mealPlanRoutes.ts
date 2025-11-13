import { Router } from 'express';
import { generateMealPlanController, getMealPlanController, rateMealPlanController } from '@controllers/mealPlanController.js';
import { authenticateToken } from '@middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/generate', generateMealPlanController);
router.get('/:mealPlanId', getMealPlanController);
router.put('/:mealPlanId/feedback', rateMealPlanController);

export default router;
