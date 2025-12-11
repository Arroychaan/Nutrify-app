import { Request, Response } from 'express';
import prisma from '@config/prisma.js';
import logger from '@config/logger.js';
import { generateNutritionEstimate } from '@services/llmService.js';

interface FoodLogData {
  id: string;
  mealType: string;
  foodName: string;
  portion: string | null;
  calories: any;
  proteinG: any;
  carbsG: any;
  fatG: any;
  loggedAt: Date;
  notes?: string | null;
}

// Type alias for prisma with foodLog
const db = prisma as any;

/**
 * Create a new food log entry
 */
export async function createFoodLog(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { mealType, foodName, portion, notes, loggedAt, calories, proteinG, carbsG, fatG } = req.body;

    if (!mealType || !foodName) {
      return res.status(400).json({
        success: false,
        error: { message: 'mealType dan foodName wajib diisi' },
      });
    }

    // If nutrition not provided, estimate using AI
    let nutritionData = { calories, proteinG, carbsG, fatG };
    if (!calories) {
      try {
        const estimate = await generateNutritionEstimate(foodName, portion || '1 porsi');
        nutritionData = estimate;
      } catch (err) {
        logger.warn('Failed to estimate nutrition, using defaults', { error: err });
        nutritionData = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
      }
    }

    const foodLog = await db.foodLog.create({
      data: {
        userId,
        mealType,
        foodName,
        portion: portion || '1 porsi',
        notes,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        calories: nutritionData.calories,
        proteinG: nutritionData.proteinG,
        carbsG: nutritionData.carbsG,
        fatG: nutritionData.fatG,
        source: 'manual',
      },
    });

    logger.info('Food log created', { userId, foodLogId: foodLog.id });

    return res.status(201).json({
      success: true,
      data: foodLog,
    });
  } catch (error) {
    logger.error('Error creating food log:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Gagal menyimpan log makanan' },
    });
  }
}

/**
 * Get food logs for a specific date
 */
export async function getFoodLogsByDate(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { date } = req.query;

    // Default to today if no date provided
    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const foodLogs: FoodLogData[] = await db.foodLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { loggedAt: 'asc' },
    });

    // Calculate daily totals
    const totals = foodLogs.reduce(
      (acc: { calories: number; proteinG: number; carbsG: number; fatG: number }, log: FoodLogData) => ({
        calories: acc.calories + (Number(log.calories) || 0),
        proteinG: acc.proteinG + (Number(log.proteinG) || 0),
        carbsG: acc.carbsG + (Number(log.carbsG) || 0),
        fatG: acc.fatG + (Number(log.fatG) || 0),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );

    return res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        logs: foodLogs,
        totals,
      },
    });
  } catch (error) {
    logger.error('Error getting food logs:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Gagal mengambil log makanan' },
    });
  }
}

/**
 * Get food logs summary for a date range
 */
export async function getFoodLogsSummary(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const foodLogs: FoodLogData[] = await db.foodLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { loggedAt: 'asc' },
    });

    // Group by date
    const dailySummary: Record<string, any> = {};
    foodLogs.forEach((log: FoodLogData) => {
      const dateKey = log.loggedAt.toISOString().split('T')[0];
      if (!dailySummary[dateKey]) {
        dailySummary[dateKey] = {
          date: dateKey,
          calories: 0,
          proteinG: 0,
          carbsG: 0,
          fatG: 0,
          mealsLogged: 0,
        };
      }
      dailySummary[dateKey].calories += Number(log.calories) || 0;
      dailySummary[dateKey].proteinG += Number(log.proteinG) || 0;
      dailySummary[dateKey].carbsG += Number(log.carbsG) || 0;
      dailySummary[dateKey].fatG += Number(log.fatG) || 0;
      dailySummary[dateKey].mealsLogged += 1;
    });

    return res.json({
      success: true,
      data: Object.values(dailySummary),
    });
  } catch (error) {
    logger.error('Error getting food logs summary:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Gagal mengambil ringkasan log makanan' },
    });
  }
}

/**
 * Delete a food log entry
 */
export async function deleteFoodLog(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const foodLog = await db.foodLog.findFirst({
      where: { id, userId },
    });

    if (!foodLog) {
      return res.status(404).json({
        success: false,
        error: { message: 'Log makanan tidak ditemukan' },
      });
    }

    await db.foodLog.delete({
      where: { id },
    });

    logger.info('Food log deleted', { userId, foodLogId: id });

    return res.json({
      success: true,
      message: 'Log makanan berhasil dihapus',
    });
  } catch (error) {
    logger.error('Error deleting food log:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Gagal menghapus log makanan' },
    });
  }
}

/**
 * Update a food log entry
 */
export async function updateFoodLog(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { mealType, foodName, portion, notes, calories, proteinG, carbsG, fatG } = req.body;

    const existingLog = await db.foodLog.findFirst({
      where: { id, userId },
    });

    if (!existingLog) {
      return res.status(404).json({
        success: false,
        error: { message: 'Log makanan tidak ditemukan' },
      });
    }

    const updatedLog = await db.foodLog.update({
      where: { id },
      data: {
        mealType: mealType || existingLog.mealType,
        foodName: foodName || existingLog.foodName,
        portion: portion || existingLog.portion,
        notes: notes !== undefined ? notes : existingLog.notes,
        calories: calories !== undefined ? calories : existingLog.calories,
        proteinG: proteinG !== undefined ? proteinG : existingLog.proteinG,
        carbsG: carbsG !== undefined ? carbsG : existingLog.carbsG,
        fatG: fatG !== undefined ? fatG : existingLog.fatG,
      },
    });

    logger.info('Food log updated', { userId, foodLogId: id });

    return res.json({
      success: true,
      data: updatedLog,
    });
  } catch (error) {
    logger.error('Error updating food log:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Gagal mengupdate log makanan' },
    });
  }
}

/**
 * Get today's calorie summary
 */
export async function getTodaySummary(req: Request, res: Response) {
  try {
    const userId = req.userId!;

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const foodLogs: FoodLogData[] = await db.foodLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Get user for calorie target calculation
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Calculate BMR and TDEE for target WITH BMI-based adjustment
    let calorieTarget = 2000; // Default
    if (user) {
      const weight = Number(user.currentWeightKg);
      const height = Number(user.heightCm);
      const age = user.dateOfBirth 
        ? Math.floor((Date.now() - user.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 30;
      
      // Mifflin-St Jeor Equation
      let bmr = 10 * weight + 6.25 * height - 5 * age;
      bmr = user.gender === 'female' ? bmr - 161 : bmr + 5;
      
      // Activity multiplier
      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };
      const multiplier = activityMultipliers[user.activityLevel || 'moderate'] || 1.55;
      let tdee = Math.round(bmr * multiplier);

      // Calculate BMI and apply adjustment for weight goals
      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);

      if (bmi >= 30) {
        // OBESITAS: deficit 750 kcal (safe weight loss ~0.75kg/week)
        tdee = Math.max(1200, tdee - 750);
      } else if (bmi >= 25) {
        // GEMUK/OVERWEIGHT: deficit 500 kcal (~0.5kg/week)
        tdee = Math.max(1200, tdee - 500);
      } else if (bmi < 18.5) {
        // KURUS/UNDERWEIGHT: surplus 400 kcal for weight gain
        tdee = tdee + 400;
      }
      // NORMAL: no adjustment

      calorieTarget = tdee;
    }

    const totals = foodLogs.reduce(
      (acc: { calories: number; proteinG: number; carbsG: number; fatG: number }, log: FoodLogData) => ({
        calories: acc.calories + (Number(log.calories) || 0),
        proteinG: acc.proteinG + (Number(log.proteinG) || 0),
        carbsG: acc.carbsG + (Number(log.carbsG) || 0),
        fatG: acc.fatG + (Number(log.fatG) || 0),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );

    // Group by meal type
    const byMealType = {
      breakfast: foodLogs.filter((l: FoodLogData) => l.mealType === 'breakfast'),
      lunch: foodLogs.filter((l: FoodLogData) => l.mealType === 'lunch'),
      dinner: foodLogs.filter((l: FoodLogData) => l.mealType === 'dinner'),
      snack: foodLogs.filter((l: FoodLogData) => l.mealType === 'snack'),
    };

    return res.json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        calorieTarget,
        caloriesConsumed: Math.round(totals.calories),
        caloriesRemaining: Math.max(0, calorieTarget - Math.round(totals.calories)),
        percentageUsed: Math.round((totals.calories / calorieTarget) * 100),
        macros: {
          protein: Math.round(totals.proteinG),
          carbs: Math.round(totals.carbsG),
          fat: Math.round(totals.fatG),
        },
        mealsLogged: foodLogs.length,
        byMealType: {
          breakfast: byMealType.breakfast.length,
          lunch: byMealType.lunch.length,
          dinner: byMealType.dinner.length,
          snack: byMealType.snack.length,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting today summary:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Gagal mengambil ringkasan hari ini' },
    });
  }
}
