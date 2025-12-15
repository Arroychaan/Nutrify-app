import { Router } from 'express';
import {
    getWeightHistoryController,
    logWeightController
} from '@controllers/biomarkerController.js';
import { authenticateToken } from '@middlewares/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/weight/history', getWeightHistoryController);
router.post('/weight', logWeightController);

export default router;
