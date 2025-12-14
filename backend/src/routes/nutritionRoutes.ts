/**
 * Ground Truth Routes
 * API routes for ground truth validation
 */

import { Router } from 'express';
import {
    validateNutrition,
    lookupNutrition,
    findFoodMatch,
    getMetrics,
} from '../controllers/groundTruthController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

/**
 * @route POST /api/nutrition/validate
 * @desc Validate nutrition data against ground truth
 * @access Private
 */
router.post('/validate', authenticateToken, validateNutrition);

/**
 * @route GET /api/nutrition/lookup
 * @desc Get nutrition data with ground truth validation
 * @access Private
 * @query food - Food name to lookup
 * @query portion - Optional portion size (default: "1 porsi")
 */
router.get('/lookup', authenticateToken, lookupNutrition);

/**
 * @route GET /api/nutrition/match
 * @desc Find best matching food in ground truth database
 * @access Private
 * @query food - Food name to match
 */
router.get('/match', authenticateToken, findFoodMatch);

/**
 * @route GET /api/nutrition/metrics
 * @desc Get ground truth validation accuracy metrics
 * @access Private
 * @query hours - Time range in hours (default: 24)
 */
router.get('/metrics', authenticateToken, getMetrics);

export default router;
