import { Router } from 'express';
import { 
  getMealPlansController,
  generateMealPlanController, 
  getMealPlanController, 
  deleteMealPlanController,
  rateMealPlanController 
} from '@controllers/mealPlanController.js';
import { authenticateToken } from '@middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getMealPlansController);
router.post('/generate', generateMealPlanController);
router.get('/:mealPlanId', getMealPlanController);
router.delete('/:mealPlanId', deleteMealPlanController);
router.put('/:mealPlanId/feedback', rateMealPlanController);

export default router;
