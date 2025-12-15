import { Request, Response } from 'express';
import prisma from '@config/prisma.js';
import logger from '@config/logger.js';
import { generateNutritionEstimate } from '@services/llmService.js';
import { getBestNutritionData } from '@services/groundTruthService.js';
import { sendOvereatingWarning } from '@services/notificationService.js';

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

// Special constant for water logging
const WATER_MEAL_TYPE = 'water';
const WATER_FOOD_NAME = 'Air Putih';

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

    // If nutrition not provided, estimate using AI and validate with Ground Truth
    let nutritionData = { calories, proteinG, carbsG, fatG };
    let source = 'manual';

    if (!calories) {
      try {
        // 1. Generate initial estimate from LLM
        const llmEstimate = await generateNutritionEstimate(foodName, portion || '1 porsi');

        // 2. Validate/Refine with Ground Truth Service
        // This checks our trusted local database first, then validates the LLM response
        const bestData = await getBestNutritionData(foodName, {
          name: foodName,
          ...llmEstimate
        });

        nutritionData = {
          calories: bestData.data.calories,
          proteinG: bestData.data.proteinG,
          carbsG: bestData.data.carbsG,
          fatG: bestData.data.fatG
        };
        source = bestData.source;

        logger.info('Nutrition estimated', {
          foodName,
          source,
          confidence: bestData.confidence
        });

      } catch (err) {
        logger.warn('Failed to estimate nutrition, using defaults', { error: err });
        nutritionData = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
        source = 'estimation_failed';
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
        source,
      },
    });

    // Update user streak
    await updateUserStreak(userId);

    // ========================================================================
    // Check for Overeating Logic
    // ========================================================================
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayStart = new Date(todayStr);
      const todayEnd = new Date(new Date(todayStr).setHours(23, 59, 59, 999));

      const todayLogs = await db.foodLog.findMany({
        where: { userId, loggedAt: { gte: todayStart, lte: todayEnd } }
      });

      const totalCalories = todayLogs.reduce((acc: number, log: any) => acc + (Number(log.calories) || 0), 0);

      // Simple default target check (2000 kcal)
      const dailyCalorieTarget = 2000;

      if (totalCalories > dailyCalorieTarget) {
        const existingWarning = await db.notification.findFirst({
          where: {
            userId,
            type: 'WARNING',
            createdAt: { gte: todayStart },
            title: { contains: 'Kalori' }
          }
        });

        if (!existingWarning) {
          await db.notification.create({
            data: {
              userId,
              type: 'WARNING',
              title: 'Peringatan Kalori! ⚠️',
              message: `Anda telah melampaui target kalori harian (${Math.round(totalCalories)} / ${dailyCalorieTarget} kkal).`,
            }
          });
        }
      }
    } catch (warnErr) {
      logger.error('Failed to process overeating warning', warnErr);
    }

    logger.info('Food log created', { userId, foodLogId: foodLog.id });

    // Check for overeating
    // 1. Calculate today's total calories
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayLogs = await db.foodLog.findMany({
      where: {
        userId,
        loggedAt: { gte: today, lte: endOfDay },
        mealType: { not: 'water' }
      },
      select: { calories: true }
    });

    const totalCalories = todayLogs.reduce((sum: number, log: any) => sum + (Number(log.calories) || 0), 0);

    // 2. Get user target (simplified TDEE or default)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    let targetCalories = 2000;

    if (user) {
      // Quick TDEE approximation if not stored
      if (user.currentWeightKg && user.heightCm && user.dateOfBirth) {
        const age = Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        let bmr = (10 * Number(user.currentWeightKg)) + (6.25 * Number(user.heightCm)) - (5 * age);
        bmr = user.gender === 'female' ? bmr - 161 : bmr + 5;
        const multiplier = user.activityLevel === 'sedentary' ? 1.2 : 1.55; // Simplified
        targetCalories = Math.round(bmr * multiplier);

        // Adjust for BMI goal
        const heightM = Number(user.heightCm) / 100;
        const bmi = Number(user.currentWeightKg) / (heightM * heightM);
        if (bmi >= 25) targetCalories -= 500;
        if (bmi < 18.5) targetCalories += 400;
      }
    }

    // 3. Trigger warning if exceeded
    // Only trigger if this specific log pushed them over, OR if they are significantly over (to avoid spamming, we could add a flag, but for now let's just warn)
    // To avoid spam, maybe check if they were ALREADY over before this log.
    const caloriesBeforeThisLog = totalCalories - Number(nutritionData.calories);

    if (totalCalories > targetCalories) {
      // If they were NOT over before, this is the crossing point -> Send Notification
      if (caloriesBeforeThisLog <= targetCalories) {
        sendOvereatingWarning(userId, totalCalories, targetCalories, foodName).catch(err => logger.error('Failed to send warning', err));
      }
    }

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
 * Update user streak based on food logging activity
 */
async function updateUserStreak(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakDays: true, lastActiveAt: true },
    });

    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if user already logged food today
    const todayStart = new Date(today);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayLogsCount = await db.foodLog.count({
      where: {
        userId,
        loggedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // If this is the first food log today, update streak
    if (todayLogsCount === 1) {
      // Check if user logged food yesterday
      const yesterdayStart = new Date(yesterday);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const yesterdayLogsCount = await db.foodLog.count({
        where: {
          userId,
          loggedAt: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          },
        },
      });

      let newStreak = 1;
      if (yesterdayLogsCount > 0) {
        // Continue streak
        newStreak = (user.streakDays || 0) + 1;
      }
      // else: streak resets to 1 (no log yesterday)

      await prisma.user.update({
        where: { id: userId },
        data: {
          streakDays: newStreak,
          lastActiveAt: new Date(),
        },
      });

      logger.info('User streak updated', { userId, newStreak });
    } else {
      // Just update lastActiveAt
      await prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      });
    }
  } catch (error) {
    logger.error('Error updating user streak:', error);
    // Don't throw - streak update failure shouldn't break food logging
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
    const { startDate, endDate } = req.query;

    let startOfDay: Date;
    let endOfDay: Date;
    let today: Date;

    if (startDate && endDate) {
      startOfDay = new Date(startDate as string);
      endOfDay = new Date(endDate as string);
      today = new Date(startDate as string); // Use start date as "today" reference
    } else {
      today = new Date();
      startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
    }

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
        totalCalories: Math.round(totals.calories),
        totalProtein: Math.round(totals.proteinG),
        totalCarbs: Math.round(totals.carbsG),
        totalFat: Math.round(totals.fatG),
        macros: {
          protein: Math.round(totals.proteinG),
          carbs: Math.round(totals.carbsG),
          fat: Math.round(totals.fatG),
        },
        mealsLogged: foodLogs.filter(f => f.mealType !== 'water').length,
        logs: foodLogs.filter(f => f.mealType !== 'water'), // Exclude water logs from main dashboard list
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

/**
 * Update water intake for a specific date (Upsert)
 */
export async function updateWaterLog(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { count, date } = req.body; // count = number of glasses (250ml approx)

    if (count === undefined || count < 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Jumlah air tidak valid' },
      });
    }

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find existing water log for today
    const existingLog = await db.foodLog.findFirst({
      where: {
        userId,
        mealType: 'water',
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let waterLog;

    if (existingLog) {
      // Update existing
      waterLog = await db.foodLog.update({
        where: { id: existingLog.id },
        data: {
          portion: `${count}`,
          notes: `${count * 250}ml`,
        },
      });
    } else {
      // Create new
      waterLog = await db.foodLog.create({
        data: {
          userId,
          mealType: 'water',
          foodName: 'Air Putih',
          portion: `${count}`,
          notes: `${count * 250}ml`,
          calories: 0,
          proteinG: 0,
          carbsG: 0,
          fatG: 0,
          loggedAt: targetDate,
          source: 'manual',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        count: Number(waterLog.portion),
        volumeMl: Number(waterLog.portion) * 250,
      },
    });
  } catch (error) {
    logger.error('Error updating water log:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Gagal mengupdate air minum' },
    });
  }
}

/**
 * Get water intake for a specific date
 */
export async function getWaterLog(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { date } = req.query;

    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const waterLog = await db.foodLog.findFirst({
      where: {
        userId,
        mealType: 'water',
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const count = waterLog ? Number(waterLog.portion) : 0;

    return res.json({
      success: true,
      data: {
        count,
        volumeMl: count * 250,
        target: 8, // Standard target
      },
    });
  } catch (error) {
    logger.error('Error getting water log:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Gagal mengambil data air minum' },
    });
  }
}
