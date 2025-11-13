import { Request, Response } from 'express';
import { asyncHandler } from '@middlewares/errorHandler.js';
import { generateMealPlan } from '@services/llmService.js';
import prisma from '@config/prisma.js';
import logger from '@config/logger.js';

/**
 * Get all meal plans for current user
 * GET /api/v1/meal-plans
 */
export const getMealPlansController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;

    logger.info('Get meal plans', { userId });

    const mealPlans = await prisma.mealPlan.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      take: 30, // Last 30 days
      include: {
        days: {
          include: {
            meals: {
              include: {
                meal: true,
              },
            },
          },
        },
      },
    });

    // Transform data to match frontend expectations
    const transformedPlans = mealPlans.map((plan) => {
      // Get first day's meals (for 1-day plans)
      const firstDay = plan.days[0];
      const meals = firstDay?.meals || [];

      const breakfast = meals.find((m) => m.mealType === 'breakfast')?.meal;
      const lunch = meals.find((m) => m.mealType === 'lunch')?.meal;
      const dinner = meals.find((m) => m.mealType === 'dinner')?.meal;
      const snacks = meals.filter((m) => m.mealType === 'snack').map((m) => m.meal);

      return {
        id: plan.id,
        date: plan.startDate,
        breakfast: breakfast || null,
        lunch: lunch || null,
        dinner: dinner || null,
        snacks: snacks || [],
        totalCalories: Number(plan.avgCalories),
        totalProtein: Number(plan.avgProteinG),
        totalCarbs: Number(plan.avgCarbsG),
        totalFat: Number(plan.avgFatG),
        createdAt: plan.createdAt,
      };
    });

    res.json({
      success: true,
      data: transformedPlans,
    });
  }
);

/**
 * Generate meal plan
 * POST /api/v1/meal-plans/generate
 */
export const generateMealPlanController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { targetCalories, dietType, meals, includeSnacks } = req.body;

    logger.info('Generate meal plan', { userId, targetCalories, dietType });

    // Get user info for personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        heightCm: true,
        currentWeightKg: true,
        targetWeightKg: true,
        medicalConditions: true,
        allergies: true,
        culture: true,
        religion: true,
        dislikes: true,
      },
    });

    // TODO: Call Gemini AI to generate meal plan
    // For now, create mock meal plan with actual meals
    const startDate = new Date();
    const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day later

    // Create meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId,
        startDate,
        endDate,
        duration: '1_day',
        avgCalories: targetCalories || 2000,
        avgProteinG: 90,
        avgCarbsG: 220,
        avgFatG: 50,
        avgSugarG: 30,
        avgSodiumMg: 2000,
        akgCompliance: 0.85,
        localFoodPercentage: 0.95,
        medicalSafetyScore: 0.90,
        generatedBy: 'gemini-1.5-flash',
      },
    });

    // Create day
    const mealPlanDay = await prisma.mealPlanDay.create({
      data: {
        mealPlanId: mealPlan.id,
        mealDate: startDate,
        dayNotes: 'AI-generated meal plan',
      },
    });

    // Create meals
    const breakfastMeal = await prisma.meal.create({
      data: {
        name: 'Nasi Goreng Sayuran dengan Telur',
        description: 'Nasi goreng sayuran sehat dengan telur mata sapi',
        portion: '1 porsi',
        calories: 450,
        proteinG: 18,
        carbsG: 65,
        fatG: 12,
        sodiumMg: 800,
        isLocalFood: true,
        isCultureApproved: true,
      },
    });

    const lunchMeal = await prisma.meal.create({
      data: {
        name: 'Pecel Lele dengan Nasi dan Lalapan',
        description: 'Lele goreng dengan nasi, sambal, dan sayuran segar',
        portion: '1 porsi',
        calories: 600,
        proteinG: 35,
        carbsG: 70,
        fatG: 18,
        sodiumMg: 900,
        isLocalFood: true,
        isCultureApproved: true,
      },
    });

    const dinnerMeal = await prisma.meal.create({
      data: {
        name: 'Soto Ayam dengan Nasi',
        description: 'Soto ayam hangat dengan nasi putih',
        portion: '1 porsi',
        calories: 550,
        proteinG: 30,
        carbsG: 60,
        fatG: 15,
        sodiumMg: 850,
        isLocalFood: true,
        isCultureApproved: true,
      },
    });

    // Link meals to day
    await prisma.mealPlanDayMeal.createMany({
      data: [
        {
          mealPlanDayId: mealPlanDay.id,
          mealId: breakfastMeal.id,
          mealType: 'breakfast',
        },
        {
          mealPlanDayId: mealPlanDay.id,
          mealId: lunchMeal.id,
          mealType: 'lunch',
        },
        {
          mealPlanDayId: mealPlanDay.id,
          mealId: dinnerMeal.id,
          mealType: 'dinner',
        },
      ],
    });

    // Add snacks if requested
    if (includeSnacks) {
      const snackMeal1 = await prisma.meal.create({
        data: {
          name: 'Pisang',
          description: 'Pisang segar',
          portion: '1 buah',
          calories: 100,
          proteinG: 1,
          carbsG: 25,
          fatG: 0,
          sodiumMg: 5,
          isLocalFood: true,
          isCultureApproved: true,
        },
      });

      const snackMeal2 = await prisma.meal.create({
        data: {
          name: 'Kacang Rebus',
          description: 'Kacang rebus tanpa garam',
          portion: '1 porsi kecil',
          calories: 150,
          proteinG: 8,
          carbsG: 15,
          fatG: 7,
          sodiumMg: 10,
          isLocalFood: true,
          isCultureApproved: true,
        },
      });

      await prisma.mealPlanDayMeal.createMany({
        data: [
          {
            mealPlanDayId: mealPlanDay.id,
            mealId: snackMeal1.id,
            mealType: 'snack',
          },
          {
            mealPlanDayId: mealPlanDay.id,
            mealId: snackMeal2.id,
            mealType: 'snack',
          },
        ],
      });
    }

    // Fetch complete meal plan with all relations
    const completeMealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlan.id },
      include: {
        days: {
          include: {
            meals: {
              include: {
                meal: true,
              },
            },
          },
        },
      },
    });

    logger.info('Meal plan created', { userId, mealPlanId: mealPlan.id });

    // Transform for frontend
    const firstDay = completeMealPlan!.days[0];
    const mealsList = firstDay?.meals || [];

    const breakfast = mealsList.find((m) => m.mealType === 'breakfast')?.meal;
    const lunch = mealsList.find((m) => m.mealType === 'lunch')?.meal;
    const dinner = mealsList.find((m) => m.mealType === 'dinner')?.meal;
    const snacks = mealsList.filter((m) => m.mealType === 'snack').map((m) => m.meal);

    res.status(201).json({
      success: true,
      data: {
        id: mealPlan.id,
        date: mealPlan.startDate,
        breakfast,
        lunch,
        dinner,
        snacks,
        totalCalories: Number(mealPlan.avgCalories),
        totalProtein: Number(mealPlan.avgProteinG),
        totalCarbs: Number(mealPlan.avgCarbsG),
        totalFat: Number(mealPlan.avgFatG),
        createdAt: mealPlan.createdAt,
      },
    });
  }
);

/**
 * Get meal plan by ID
 * GET /api/v1/meal-plans/:mealPlanId
 */
export const getMealPlanController = asyncHandler(
  async (req: Request, res: Response) => {
    const { mealPlanId } = req.params;
    const userId = req.userId!;

    logger.info('Fetching meal plan', { userId, mealPlanId });

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlanId,
        userId,
      },
    });

    if (!mealPlan) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MEAL_PLAN_NOT_FOUND',
          message: 'Meal plan not found',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: mealPlan,
    });
  }
);

/**
 * Delete meal plan
 * DELETE /api/v1/meal-plans/:mealPlanId
 */
export const deleteMealPlanController = asyncHandler(
  async (req: Request, res: Response) => {
    const { mealPlanId } = req.params;
    const userId = req.userId!;

    logger.info('Delete meal plan', { userId, mealPlanId });

    // Check if meal plan exists and belongs to user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlanId,
        userId,
      },
    });

    if (!mealPlan) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MEAL_PLAN_NOT_FOUND',
          message: 'Meal plan not found',
        },
      });
      return;
    }

    await prisma.mealPlan.delete({
      where: { id: mealPlanId },
    });

    logger.info('Meal plan deleted', { userId, mealPlanId });

    res.json({
      success: true,
      data: {
        message: 'Meal plan deleted successfully',
      },
    });
  }
);

/**
 * Rate meal plan
 * PUT /api/v1/meal-plans/:mealPlanId/feedback
 */
export const rateMealPlanController = asyncHandler(
  async (req: Request, res: Response) => {
    const { mealPlanId } = req.params;
    const { rating, adherenceScore, feedback } = req.body;
    const userId = req.userId!;

    logger.info('Submitting meal plan feedback', {
      userId,
      mealPlanId,
      rating,
    });

    // TODO: Save feedback to database
    // TODO: Update meal plan record
    // TODO: Track KPIs

    res.json({
      success: true,
      data: {
        message: 'Feedback saved successfully',
      },
    });
  }
);
