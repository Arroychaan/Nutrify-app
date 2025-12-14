/**
 * Ground Truth Controller
 * API endpoints for ground truth validation and monitoring
 */

import { Request, Response } from 'express';
import {
    validateNutritionEstimate,
    findBestMatch,
    getAccuracyMetrics,
    type NutritionEstimate,
} from '../services/groundTruthService.js';
import { getNutritionData } from '../utils/nutritionLookup.js';
import logger from '../config/logger.js';

/**
 * Validate nutrition data against ground truth
 * POST /api/nutrition/validate
 */
export async function validateNutrition(req: Request, res: Response): Promise<void> {
    try {
        const { name, calories, proteinG, carbsG, fatG } = req.body;

        if (!name) {
            res.status(400).json({
                success: false,
                error: 'Food name is required',
            });
            return;
        }

        const estimate: NutritionEstimate = {
            name,
            calories: Number(calories) || 0,
            proteinG: Number(proteinG) || 0,
            carbsG: Number(carbsG) || 0,
            fatG: Number(fatG) || 0,
        };

        const validation = await validateNutritionEstimate(estimate);

        res.json({
            success: true,
            data: {
                isValid: validation.isValid,
                confidenceScore: validation.confidenceScore,
                source: validation.source,
                matchedFood: validation.matchedFoodName,
                similarityScore: validation.similarityScore,
                originalEstimate: validation.originalEstimate,
                correctedEstimate: validation.correctedEstimate,
                groundTruthData: validation.groundTruthData,
                deviations: validation.deviations,
            },
        });
    } catch (error) {
        logger.error('Error validating nutrition:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate nutrition data',
        });
    }
}

/**
 * Get nutrition data with ground truth validation
 * GET /api/nutrition/lookup?food=nama_makanan
 */
export async function lookupNutrition(req: Request, res: Response): Promise<void> {
    try {
        const { food, portion } = req.query;

        if (!food || typeof food !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Food name is required (query param: food)',
            });
            return;
        }

        const nutritionData = await getNutritionData(
            food,
            typeof portion === 'string' ? portion : '1 porsi'
        );

        res.json({
            success: true,
            data: {
                name: nutritionData.name,
                calories: nutritionData.calories,
                proteinG: nutritionData.proteinG,
                carbsG: nutritionData.carbsG,
                fatG: nutritionData.fatG,
                source: nutritionData.source,
                confidenceScore: nutritionData.confidenceScore,
                // Include validation details if present
                validation: nutritionData.validation ? {
                    matchedFood: nutritionData.validation.matchedFoodName,
                    similarityScore: nutritionData.validation.similarityScore,
                    deviations: nutritionData.validation.deviations,
                } : undefined,
            },
        });
    } catch (error) {
        logger.error('Error looking up nutrition:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to lookup nutrition data',
        });
    }
}

/**
 * Find best match for a food name in ground truth database
 * GET /api/nutrition/match?food=nama_makanan
 */
export async function findFoodMatch(req: Request, res: Response): Promise<void> {
    try {
        const { food } = req.query;

        if (!food || typeof food !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Food name is required (query param: food)',
            });
            return;
        }

        const match = await findBestMatch(food);

        if (!match) {
            res.json({
                success: true,
                data: {
                    found: false,
                    message: 'No matching food found in ground truth database',
                    query: food,
                },
            });
            return;
        }

        res.json({
            success: true,
            data: {
                found: true,
                query: food,
                match: {
                    name: match.food.name,
                    similarityScore: Math.round(match.similarityScore * 100),
                    nutrition: {
                        calories: Number(match.food.calories),
                        proteinG: Number(match.food.proteinG),
                        carbsG: Number(match.food.carbsG),
                        fatG: Number(match.food.fatG),
                    },
                    category: match.food.category,
                },
            },
        });
    } catch (error) {
        logger.error('Error finding food match:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to find food match',
        });
    }
}

/**
 * Get ground truth validation metrics
 * GET /api/nutrition/metrics
 */
export async function getMetrics(req: Request, res: Response): Promise<void> {
    try {
        const hours = req.query.hours ? Number(req.query.hours) : 24;
        const metrics = await getAccuracyMetrics(hours);

        res.json({
            success: true,
            data: {
                timeRangeHours: hours,
                metrics,
            },
        });
    } catch (error) {
        logger.error('Error getting metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get accuracy metrics',
        });
    }
}

export default {
    validateNutrition,
    lookupNutrition,
    findFoodMatch,
    getMetrics,
};
