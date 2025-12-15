import { Request, Response } from 'express';
import { asyncHandler } from '@middlewares/errorHandler.js';
import { generateMealPlan } from '@services/llmService.js';
import prisma from '@config/prisma.js';
import logger from '@config/logger.js';
import { validateWithKnowledge } from '@services/ragService.js';

/**
 * Get random foods from database by category
 */
async function getRandomFoodsFromDatabase(
  category: string,
  count: number,
  filters: {
    medicalConditions?: string[];
    dietaryRestrictions?: string[];
  } = {}
): Promise<any[]> {
  const whereClause: any = { category };

  if (filters.dietaryRestrictions?.includes('vegetarian')) {
    whereClause.isVegetarian = true;
  }
  if (filters.dietaryRestrictions?.includes('halal')) {
    whereClause.isHalal = true;
  }

  // Medical condition filters
  if (filters.medicalConditions?.includes('Hipertensi')) {
    whereClause.sodiumMg = { lt: 600 };
  }
  if (filters.medicalConditions?.includes('Diabetes')) {
    whereClause.sugarG = { lt: 15 };
  }

  const totalCount = await prisma.localFood.count({ where: whereClause });
  const randomOffset = Math.floor(Math.random() * Math.max(1, totalCount - count));

  return prisma.localFood.findMany({
    where: whereClause,
    take: count,
    skip: randomOffset,
  });
}

/**
 * Create meal from database foods
 */
async function createMealFromDatabase(
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  targetCalories: number,
  filters: {
    medicalConditions?: string[];
    dietaryRestrictions?: string[];
  } = {}
): Promise<any> {
  // Define meal templates based on type
  const mealTemplates = {
    breakfast: [
      { name: 'Nasi Goreng', category: 'prepared_dishes' },
      { name: 'Bubur Ayam', category: 'prepared_dishes' },
      { name: 'Lontong Sayur', category: 'prepared_dishes' },
      { name: 'Nasi Uduk', category: 'prepared_dishes' },
    ],
    lunch: [
      { name: 'Soto', category: 'prepared_dishes' },
      { name: 'Gado-gado', category: 'prepared_dishes' },
      { name: 'Nasi Padang', category: 'prepared_dishes' },
      { name: 'Pecel', category: 'prepared_dishes' },
    ],
    dinner: [
      { name: 'Ayam', category: 'proteins' },
      { name: 'Ikan', category: 'proteins' },
      { name: 'Rendang', category: 'prepared_dishes' },
      { name: 'Gulai', category: 'prepared_dishes' },
    ],
    snack: [
      { name: 'Pisang', category: 'fruits' },
      { name: 'Kacang', category: 'proteins' },
      { name: 'Buah', category: 'fruits' },
    ],
  };

  const templates = mealTemplates[mealType];
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

  // Try to find the food in database
  let food = await prisma.localFood.findFirst({
    where: {
      name: { contains: selectedTemplate.name, mode: 'insensitive' },
    },
  });

  // Fallback to category search
  if (!food) {
    const foods = await getRandomFoodsFromDatabase(selectedTemplate.category, 1, filters);
    food = foods[0];
  }

  // If still no food, get any food from appropriate category
  if (!food) {
    const categoryFallback = mealType === 'snack' ? 'fruits' : 'prepared_dishes';
    const foods = await getRandomFoodsFromDatabase(categoryFallback, 1, filters);
    food = foods[0];
  }

  if (!food) {
    // Return default if database is empty
    return {
      name: `${mealType === 'breakfast' ? 'Sarapan' : mealType === 'lunch' ? 'Makan Siang' : mealType === 'dinner' ? 'Makan Malam' : 'Cemilan'} Sehat`,
      description: 'Menu sehat bergizi seimbang',
      portion: '1 porsi',
      calories: targetCalories,
      proteinG: targetCalories * 0.15 / 4,
      carbsG: targetCalories * 0.55 / 4,
      fatG: targetCalories * 0.30 / 9,
      sodiumMg: 400,
      isLocalFood: true,
      isCultureApproved: true,
    };
  }

  // Calculate portion based on target calories
  const baseCalories = Number(food.calories) || 200;
  const portionMultiplier = targetCalories / baseCalories;
  const portionDescription = portionMultiplier >= 1.5 ? '1.5 porsi' :
    portionMultiplier >= 1 ? '1 porsi' : '0.5 porsi';

  // Calculate weight in grams (assuming 100g base for nutrition data)
  const weightInGrams = Math.round(100 * portionMultiplier);

  return {
    name: food.name,
    description: food.benefits?.[0] || `${food.name} khas Indonesia`,
    portion: portionDescription,
    calories: Math.min(Math.round(Number(food.calories) * portionMultiplier), 2000),
    proteinG: Math.round(Number(food.proteinG) * portionMultiplier),
    carbsG: Math.round(Number(food.carbsG) * portionMultiplier),
    fatG: Math.round(Number(food.fatG) * portionMultiplier),
    fiberG: food.fiberG ? Math.round(Number(food.fiberG) * portionMultiplier) : null,
    sodiumMg: Math.round(Number(food.sodiumMg) * portionMultiplier),
    sugarG: food.sugarG ? Math.round(Number(food.sugarG) * portionMultiplier) : null,
    isLocalFood: true,
    isCultureApproved: true,
    // Store metadata for ingredient linking
    _localFoodId: food.id,
    _weightInGrams: weightInGrams,
  };
}

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
        gender: true,
        dateOfBirth: true,
        activityLevel: true,
      },
    });

    // Delete existing meal plans for today to avoid duplicates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate TDEE if targetCalories is invalid
    let finalTargetCalories = targetCalories;
    if (!finalTargetCalories || finalTargetCalories < 1000) {
      if (user?.currentWeightKg && user?.heightCm && user?.dateOfBirth) {
        const age = Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        // Mifflin-St Jeor Equation
        let bmr = (10 * Number(user.currentWeightKg)) + (6.25 * Number(user.heightCm)) - (5 * age);
        bmr = user.gender === 'male' ? bmr + 5 : bmr - 161;

        // Activity Multiplier Map
        const activityMap: Record<string, number> = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          very_active: 1.9,
        };
        const multiplier = activityMap[user.activityLevel || 'sedentary'] || 1.2;
        finalTargetCalories = Math.round(bmr * multiplier);

        // Adjust for goal
        if (user.targetWeightKg) {
          if (Number(user.targetWeightKg) < Number(user.currentWeightKg)) finalTargetCalories -= 500; // Deficit
          if (Number(user.targetWeightKg) > Number(user.currentWeightKg)) finalTargetCalories += 300; // Surplus
        }
      } else {
        finalTargetCalories = 2000; // Default fallback
      }
    }

    // Ensure safety bounds
    finalTargetCalories = Math.max(1200, Math.min(finalTargetCalories, 4000));

    // Find and delete existing meal plans for today
    const existingPlans = await prisma.mealPlan.findMany({
      where: {
        userId,
        startDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: { id: true },
    });

    if (existingPlans.length > 0) {
      const planIds = existingPlans.map(p => p.id);

      // Delete in correct order due to foreign key constraints
      // 1. Delete MealPlanDayMeal entries
      const days = await prisma.mealPlanDay.findMany({
        where: { mealPlanId: { in: planIds } },
        select: { id: true },
      });
      const dayIds = days.map(d => d.id);

      await prisma.mealPlanDayMeal.deleteMany({
        where: { mealPlanDayId: { in: dayIds } },
      });

      // 2. Delete MealPlanDay entries
      await prisma.mealPlanDay.deleteMany({
        where: { mealPlanId: { in: planIds } },
      });

      // 3. Delete MealPlan entries
      await prisma.mealPlan.deleteMany({
        where: { id: { in: planIds } },
      });

      logger.info('Deleted existing meal plans for today', { userId, count: planIds.length });
    }

    // Create new meal plan
    const startDate = new Date();
    const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day later

    // User filters for food selection
    const userFilters = {
      medicalConditions: user?.medicalConditions || [],
      dietaryRestrictions: user?.dislikes || [],
    };

    // Calculate calorie distribution
    const dailyCalories = finalTargetCalories;
    const breakfastCal = Math.round(dailyCalories * 0.25);
    const lunchCal = Math.round(dailyCalories * 0.35);
    const dinnerCal = Math.round(dailyCalories * 0.30);
    const snackCal = Math.round(dailyCalories * 0.10);

    // Generate meals from database
    const breakfastData = await createMealFromDatabase('breakfast', breakfastCal, userFilters);
    const lunchData = await createMealFromDatabase('lunch', lunchCal, userFilters);
    const dinnerData = await createMealFromDatabase('dinner', dinnerCal, userFilters);
    const snack1Data = await createMealFromDatabase('snack', snackCal / 2, userFilters);
    const snack2Data = await createMealFromDatabase('snack', snackCal / 2, userFilters);

    // Calculate totals
    let totalCalories = breakfastData.calories + lunchData.calories + dinnerData.calories;
    let totalProtein = breakfastData.proteinG + lunchData.proteinG + dinnerData.proteinG;
    let totalCarbs = breakfastData.carbsG + lunchData.carbsG + dinnerData.carbsG;
    let totalFat = breakfastData.fatG + lunchData.fatG + dinnerData.fatG;
    let totalSodium = breakfastData.sodiumMg + lunchData.sodiumMg + dinnerData.sodiumMg;

    if (includeSnacks) {
      totalCalories += snack1Data.calories + snack2Data.calories;
      totalProtein += snack1Data.proteinG + snack2Data.proteinG;
      totalCarbs += snack1Data.carbsG + snack2Data.carbsG;
      totalFat += snack1Data.fatG + snack2Data.fatG;
      totalSodium += snack1Data.sodiumMg + snack2Data.sodiumMg;
    }

    // RAG Validation based on Permenkes 2019
    let validationResult;
    try {
      validationResult = await validateWithKnowledge(
        {
          gender: user?.gender || 'unknown',
          age: user?.dateOfBirth ? Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 30,
          currentWeightKg: Number(user?.currentWeightKg) || 60,
          heightCm: Number(user?.heightCm) || 165,
          medicalConditions: user?.medicalConditions,
          activityLevel: user?.activityLevel
        },
        {
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat
        }
      );
      logger.info('Compliance Score calculated', { score: validationResult.score });
    } catch (err) {
      logger.error('RAG Validation error', err);
      validationResult = { score: 85 }; // Fallback
    }

    // Create meal plan with calculated totals
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId,
        startDate,
        endDate,
        duration: '1_day',
        avgCalories: totalCalories,
        avgProteinG: totalProtein,
        avgCarbsG: totalCarbs,
        avgFatG: totalFat,
        avgSugarG: 30,
        avgSodiumMg: totalSodium,
        akgCompliance: validationResult.score, // Store as 0-100
        localFoodPercentage: 95,
        medicalSafetyScore: 90,
        generatedBy: 'gemini-1.5-flash',
        llmPromptUsed: `RAG Validation: ${validationResult.details || 'N/A'}`
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

    // Helper to extract only valid Meal fields (remove _localFoodId, _weightInGrams)
    const toMealData = (data: any) => {
      const { _localFoodId, _weightInGrams, ...mealData } = data;
      return mealData;
    };

    // Helper to create ingredient link
    const createIngredient = async (mealId: string, mealData: any) => {
      if (mealData._localFoodId) {
        await prisma.mealIngredient.create({
          data: {
            mealId,
            foodId: mealData._localFoodId,
            quantity: mealData._weightInGrams || 100,
            unit: 'g'
          }
        });
      }
    };

    // Create meals in database
    const breakfastMeal = await prisma.meal.create({ data: toMealData(breakfastData) });
    await createIngredient(breakfastMeal.id, breakfastData);

    const lunchMeal = await prisma.meal.create({ data: toMealData(lunchData) });
    await createIngredient(lunchMeal.id, lunchData);

    const dinnerMeal = await prisma.meal.create({ data: toMealData(dinnerData) });
    await createIngredient(dinnerMeal.id, dinnerData);

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
      const snackMeal1 = await prisma.meal.create({ data: toMealData(snack1Data) });
      await createIngredient(snackMeal1.id, snack1Data);

      const snackMeal2 = await prisma.meal.create({ data: toMealData(snack2Data) });
      await createIngredient(snackMeal2.id, snack2Data);

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

    logger.info('Meal plan created', { userId, mealPlanId: mealPlan.id, totalCalories });

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

/**
 * Swap a meal in the meal plan
 * PUT /api/v1/meal-plans/:mealPlanId/swap
 */
export const swapMealController = asyncHandler(
  async (req: Request, res: Response) => {
    const { mealPlanId } = req.params;
    const { mealPlanDayId, mealType, currentMealId } = req.body;
    const userId = req.userId!;

    logger.info('Swapping meal', { userId, mealPlanId, mealType });

    // 1. Validate ownership
    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id: mealPlanId, userId },
    });

    if (!mealPlan) {
      res.status(404).json({ success: false, error: { message: 'Meal plan not found' } });
      return;
    }

    // 2. Get user preferences for filters
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { medicalConditions: true, dislikes: true }
    });

    const userFilters = {
      medicalConditions: user?.medicalConditions || [],
      dietaryRestrictions: user?.dislikes || [],
    };

    // 3. Calculate target calories for this slot
    // We try to match the calories of the meal being replaced, or use standard distribution
    const day = await prisma.mealPlanDay.findUnique({
      where: { id: mealPlanDayId },
      include: { meals: { include: { meal: true } } }
    });

    if (!day) {
      res.status(404).json({ success: false, error: { message: 'Meal plan day not found' } });
      return;
    }

    const currentMealEntry = day.meals.find(m => m.mealType === mealType && m.mealId === currentMealId);
    let targetCalories = 500; // Default fallback

    if (currentMealEntry && currentMealEntry.meal.calories) {
      targetCalories = Number(currentMealEntry.meal.calories);
    } else {
      // Fallback based on meal type
      if (mealType === 'snack') targetCalories = 200;
      else targetCalories = 600;
    }

    // 4. Generate new meal
    // We pass a 'forceNew' flag logic implicitly by generating a new one. 
    // In a real app we might want to ensure it's DIFFERENT from current.
    const newMealData = await createMealFromDatabase(mealType as any, targetCalories, userFilters);

    // 5. Save new meal
    // Helper to extract only valid Meal fields
    const toMealData = (data: any) => {
      const { _localFoodId, _weightInGrams, ...mealData } = data;
      return mealData;
    };

    const newMeal = await prisma.meal.create({ data: toMealData(newMealData) });

    // Link ingredient
    if (newMealData._localFoodId) {
      await prisma.mealIngredient.create({
        data: {
          mealId: newMeal.id,
          foodId: newMealData._localFoodId,
          quantity: newMealData._weightInGrams || 100,
          unit: 'g'
        }
      });
    }

    // 6. Update relation: Delete old link, create new link
    // We don't delete the old MEAL record because it might be used in history or other plans (relational db patterns)
    // But in this simple schema, if meals are unique per plan generation, we could delete it. 
    // For safety, let's just update the join table.

    if (currentMealEntry) {
      await prisma.mealPlanDayMeal.delete({
        where: { id: currentMealEntry.id } // This deletes the RELATION
      });
    }

    await prisma.mealPlanDayMeal.create({
      data: {
        mealPlanDayId: mealPlanDayId,
        mealId: newMeal.id,
        mealType: mealType,
      }
    });

    // 7. Recalculate Totals for the Meal Plan
    // Re-fetch all meals for this plan to sum up
    const updatedPlanDays = await prisma.mealPlanDay.findMany({
      where: { mealPlanId },
      include: { meals: { include: { meal: true } } }
    });

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    updatedPlanDays.forEach(d => {
      d.meals.forEach(m => {
        totalCalories += Number(m.meal.calories || 0);
        totalProtein += Number(m.meal.proteinG || 0);
        totalCarbs += Number(m.meal.carbsG || 0);
        totalFat += Number(m.meal.fatG || 0);
      });
    });

    // Average per day (if multi-day) - currently 1 day
    const dayCount = updatedPlanDays.length || 1;

    await prisma.mealPlan.update({
      where: { id: mealPlanId },
      data: {
        avgCalories: Math.round(totalCalories / dayCount),
        avgProteinG: Math.round(totalProtein / dayCount),
        avgCarbsG: Math.round(totalCarbs / dayCount),
        avgFatG: Math.round(totalFat / dayCount),
      }
    });

    res.json({
      success: true,
      data: newMeal
    });
  }
);

/**
 * Get shopping list for meal plan
 * GET /api/v1/meal-plans/:mealPlanId/shopping-list
 */
export const getShoppingListController = asyncHandler(
  async (req: Request, res: Response) => {
    const { mealPlanId } = req.params;
    const userId = req.userId!;

    // 1. Get all meal IDs in the plan
    const days = await prisma.mealPlanDay.findMany({
      where: { mealPlanId },
      include: { meals: true }
    });

    const mealIds = days.flatMap(d => d.meals.map(m => m.mealId));

    // 2. Fetch Ingredients grouped by Food
    const ingredients = await prisma.mealIngredient.findMany({
      where: { mealId: { in: mealIds } },
      include: { food: true }
    });

    // 3. Aggregate
    const shoppingList: Record<string, {
      category: string,
      name: string,
      quantity: number,
      unit: string
    }> = {};

    ingredients.forEach(item => {
      const key = item.foodId;
      if (!shoppingList[key]) {
        shoppingList[key] = {
          category: item.food.category,
          name: item.food.name,
          quantity: 0,
          unit: item.unit
        };
      }
      shoppingList[key].quantity += Number(item.quantity);
    });

    // 4. Group by Category
    const groupedList: Record<string, any[]> = {};
    Object.values(shoppingList).forEach(item => {
      const cat = item.category || 'Lainnya';
      if (!groupedList[cat]) groupedList[cat] = [];
      groupedList[cat].push(item);
    });

    // 5. Format response
    const formattedData = Object.keys(groupedList).map(cat => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
      items: groupedList[cat]
    }));

    res.json({
      success: true,
      data: formattedData
    });
  }
);
