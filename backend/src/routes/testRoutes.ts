
import { Router, Request, Response } from 'express';
import { validateWithKnowledge } from '../services/ragService.js';
import { getBestNutritionData } from '../services/groundTruthService.js';

const router = Router();

router.get('/validation/rag', async (req: Request, res: Response) => {
    try {
        const mockUser = {
            gender: 'male',
            age: 25,
            currentWeightKg: 70,
            heightCm: 175,
            medicalConditions: [],
            activityLevel: 'moderate'
        };

        const mockMealPlan = {
            totalCalories: 2100,
            totalProtein: 70,
            totalCarbs: 300,
            totalFat: 60
        };

        const result = await validateWithKnowledge(mockUser, mockMealPlan);
        res.json({
            success: true,
            message: 'RAG Validation Test',
            input: { mockUser, mockMealPlan },
            result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/validation/ground-truth', async (req: Request, res: Response) => {
    try {
        const foodName = req.query.food as string || 'Nasi Goreng';
        const result = await getBestNutritionData(foodName);

        res.json({
            success: true,
            message: 'Ground Truth Test',
            foodName,
            result
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
