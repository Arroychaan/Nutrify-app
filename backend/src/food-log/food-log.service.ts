import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema.js';
import { foodLogs, users, notifications } from '../db/schema.js';
import { eq, and, desc, asc, count, sql, gte, lte, not } from 'drizzle-orm';
import { LlmService } from '../llm/llm.service.js';
import { GroundTruthService } from '../food/ground-truth.service.js';
import { NotificationService } from '../notification/notification.service.js';

@Injectable()
export class FoodLogService {
  private readonly logger = new Logger(FoodLogService.name);

  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
    private llmService: LlmService,
    private groundTruthService: GroundTruthService,
    private notificationService: NotificationService,
  ) {}

  async createFoodLog(userId: string, body: any) {
    const {
      mealType,
      foodName,
      portion,
      notes,
      loggedAt,
      calories,
      proteinG,
      carbsG,
      fatG,
    } = body;

    if (!mealType || !foodName) {
      throw new BadRequestException('mealType dan foodName wajib diisi');
    }

    let nutritionData = {
      calories: calories !== undefined ? Number(calories) : null,
      proteinG: proteinG !== undefined ? Number(proteinG) : null,
      carbsG: carbsG !== undefined ? Number(carbsG) : null,
      fatG: fatG !== undefined ? Number(fatG) : null,
    };
    let source = 'manual';

    if (nutritionData.calories === null) {
      try {
        const llmEstimate = await this.llmService.generateNutritionEstimate(
          foodName,
          portion || '1 porsi',
        );

        const bestData = await this.groundTruthService.getBestNutritionData(
          foodName,
          {
            name: foodName,
            ...llmEstimate,
          },
        );

        nutritionData = {
          calories: Number(bestData.data.calories),
          proteinG: Number(bestData.data.proteinG),
          carbsG: Number(bestData.data.carbsG),
          fatG: Number(bestData.data.fatG),
        };
        source = bestData.source;
      } catch (err) {
        this.logger.error('Failed to estimate nutrition, using defaults', err);
        nutritionData = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
        source = 'estimation_failed';
      }
    }

    const [foodLog] = await this.db
      .insert(foodLogs)
      .values({
        userId,
        mealType,
        foodName,
        portion: portion || '1 porsi',
        notes: notes || null,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        calories: nutritionData.calories?.toString() || '0.00',
        proteinG: nutritionData.proteinG?.toString() || '0.00',
        carbsG: nutritionData.carbsG?.toString() || '0.00',
        fatG: nutritionData.fatG?.toString() || '0.00',
        source,
      })
      .returning();

    // Update streak
    await this.updateUserStreak(userId);

    // Overeating warning logic
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayStart = new Date(todayStr);
      const todayEnd = new Date(new Date(todayStr).setHours(23, 59, 59, 999));

      const todayLogs = await this.db
        .select()
        .from(foodLogs)
        .where(
          and(
            eq(foodLogs.userId, userId),
            sql`${foodLogs.loggedAt} >= ${todayStart}`,
            sql`${foodLogs.loggedAt} <= ${todayEnd}`,
          ),
        );

      const totalCalories = todayLogs.reduce(
        (acc, log) => acc + (Number(log.calories) || 0),
        0,
      );
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      let targetCalories = 2000;
      if (user) {
        if (user.currentWeightKg && user.heightCm && user.dateOfBirth) {
          const age = Math.floor(
            (Date.now() - new Date(user.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
          );
          let bmr =
            10 * Number(user.currentWeightKg) +
            6.25 * Number(user.heightCm) -
            5 * age;
          bmr = user.gender === 'female' ? bmr - 161 : bmr + 5;
          const multiplier = user.activityLevel === 'sedentary' ? 1.2 : 1.55;
          targetCalories = Math.round(bmr * multiplier);

          const heightM = Number(user.heightCm) / 100;
          const bmi = Number(user.currentWeightKg) / (heightM * heightM);
          if (bmi >= 25) targetCalories -= 500;
          if (bmi < 18.5) targetCalories += 400;
        }
      }

      if (totalCalories > targetCalories) {
        // Send alert if crossing threshold
        const caloriesBeforeLog =
          totalCalories - (Number(foodLog.calories) || 0);
        if (caloriesBeforeLog <= targetCalories) {
          await this.notificationService.sendOvereatingWarning(
            userId,
            totalCalories,
            targetCalories,
            foodName,
          );
        }
      }
    } catch (warnErr) {
      this.logger.error('Failed to process overeating warning', warnErr);
    }

    return foodLog;
  }

  async updateUserStreak(userId: string) {
    try {
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayStart = today;
      const todayEnd = new Date(today.getTime() + 23 * 59 * 59 * 999);

      const [todayCountResult] = await this.db
        .select({ total: count() })
        .from(foodLogs)
        .where(
          and(
            eq(foodLogs.userId, userId),
            sql`${foodLogs.loggedAt} >= ${todayStart}`,
            sql`${foodLogs.loggedAt} <= ${todayEnd}`,
          ),
        );

      const todayLogsCount = todayCountResult?.total || 0;

      if (todayLogsCount === 1) {
        const yesterdayStart = yesterday;
        const yesterdayEnd = new Date(yesterday.getTime() + 23 * 59 * 59 * 999);

        const [yesterdayCountResult] = await this.db
          .select({ total: count() })
          .from(foodLogs)
          .where(
            and(
              eq(foodLogs.userId, userId),
              sql`${foodLogs.loggedAt} >= ${yesterdayStart}`,
              sql`${foodLogs.loggedAt} <= ${yesterdayEnd}`,
            ),
          );

        const yesterdayLogsCount = yesterdayCountResult?.total || 0;

        let newStreak = 1;
        if (yesterdayLogsCount > 0) {
          newStreak = (user.streakDays || 0) + 1;
        }

        await this.db
          .update(users)
          .set({
            streakDays: newStreak,
            lastActiveAt: new Date(),
          })
          .where(eq(users.id, userId));
      } else {
        await this.db
          .update(users)
          .set({ lastActiveAt: new Date() })
          .where(eq(users.id, userId));
      }
    } catch (error) {
      this.logger.error('Error updating user streak:', error);
    }
  }

  async getFoodLogsByDate(userId: string, query: any) {
    const { date } = query;

    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await this.db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          sql`${foodLogs.loggedAt} >= ${startOfDay}`,
          sql`${foodLogs.loggedAt} <= ${endOfDay}`,
        ),
      )
      .orderBy(asc(foodLogs.loggedAt));

    const totals = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + (Number(log.calories) || 0),
        proteinG: acc.proteinG + (Number(log.proteinG) || 0),
        carbsG: acc.carbsG + (Number(log.carbsG) || 0),
        fatG: acc.fatG + (Number(log.fatG) || 0),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    );

    return {
      date: targetDate.toISOString().split('T')[0],
      logs,
      totals,
    };
  }

  async getFoodLogsSummary(userId: string, query: any) {
    const { startDate, endDate } = query;

    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const logs = await this.db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          sql`${foodLogs.loggedAt} >= ${start}`,
          sql`${foodLogs.loggedAt} <= ${end}`,
        ),
      )
      .orderBy(asc(foodLogs.loggedAt));

    const dailySummary: Record<string, any> = {};
    logs.forEach((log) => {
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

    return Object.values(dailySummary);
  }

  async deleteFoodLog(userId: string, id: string) {
    const [existing] = await this.db
      .select()
      .from(foodLogs)
      .where(and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Log makanan tidak ditemukan');
    }

    await this.db.delete(foodLogs).where(eq(foodLogs.id, id));
    return { message: 'Log makanan berhasil dihapus' };
  }

  async updateFoodLog(userId: string, id: string, body: any) {
    const {
      mealType,
      foodName,
      portion,
      notes,
      calories,
      proteinG,
      carbsG,
      fatG,
    } = body;

    const [existing] = await this.db
      .select()
      .from(foodLogs)
      .where(and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Log makanan tidak ditemukan');
    }

    const [updated] = await this.db
      .update(foodLogs)
      .set({
        mealType: mealType || existing.mealType,
        foodName: foodName || existing.foodName,
        portion: portion || existing.portion,
        notes: notes !== undefined ? notes : existing.notes,
        calories:
          calories !== undefined ? calories.toString() : existing.calories,
        proteinG:
          proteinG !== undefined ? proteinG.toString() : existing.proteinG,
        carbsG: carbsG !== undefined ? carbsG.toString() : existing.carbsG,
        fatG: fatG !== undefined ? fatG.toString() : existing.fatG,
      })
      .where(eq(foodLogs.id, id))
      .returning();

    return updated;
  }

  async getTodaySummary(userId: string, query: any) {
    const { startDate, endDate } = query;

    let startOfDay: Date;
    let endOfDay: Date;
    let todayRef: Date;

    if (startDate && endDate) {
      startOfDay = new Date(startDate as string);
      endOfDay = new Date(endDate as string);
      todayRef = new Date(startDate as string);
    } else {
      todayRef = new Date();
      startOfDay = new Date(todayRef);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(todayRef);
      endOfDay.setHours(23, 59, 59, 999);
    }

    const logs = await this.db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          sql`${foodLogs.loggedAt} >= ${startOfDay}`,
          sql`${foodLogs.loggedAt} <= ${endOfDay}`,
        ),
      );

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    let calorieTarget = 2000;
    if (user) {
      const weight = Number(user.currentWeightKg);
      const height = Number(user.heightCm);
      const age = user.dateOfBirth
        ? Math.floor(
            (Date.now() - user.dateOfBirth.getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
          )
        : 30;

      let bmr = 10 * weight + 6.25 * height - 5 * age;
      bmr = user.gender === 'female' ? bmr - 161 : bmr + 5;

      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };
      const multiplier =
        activityMultipliers[user.activityLevel || 'moderate'] || 1.55;
      let tdee = Math.round(bmr * multiplier);

      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);

      if (bmi >= 30) {
        tdee = Math.max(1200, tdee - 750);
      } else if (bmi >= 25) {
        tdee = Math.max(1200, tdee - 500);
      } else if (bmi < 18.5) {
        tdee = tdee + 400;
      }

      calorieTarget = tdee;
    }

    const totals = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + (Number(log.calories) || 0),
        proteinG: acc.proteinG + (Number(log.proteinG) || 0),
        carbsG: acc.carbsG + (Number(log.carbsG) || 0),
        fatG: acc.fatG + (Number(log.fatG) || 0),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    );

    const logsFiltered = logs.filter((l) => l.mealType !== 'water');

    return {
      date: todayRef.toISOString().split('T')[0],
      calorieTarget,
      caloriesConsumed: Math.round(totals.calories),
      caloriesRemaining: Math.max(
        0,
        calorieTarget - Math.round(totals.calories),
      ),
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
      mealsLogged: logsFiltered.length,
      logs: logsFiltered,
      byMealType: {
        breakfast: logsFiltered.filter((l) => l.mealType === 'breakfast')
          .length,
        lunch: logsFiltered.filter((l) => l.mealType === 'lunch').length,
        dinner: logsFiltered.filter((l) => l.mealType === 'dinner').length,
        snack: logsFiltered.filter((l) => l.mealType === 'snack').length,
      },
    };
  }

  async updateWaterLog(userId: string, body: any) {
    const { count: glassCount, date } = body;

    if (glassCount === undefined || glassCount < 0) {
      throw new BadRequestException('Jumlah air tidak valid');
    }

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [existing] = await this.db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          eq(foodLogs.mealType, 'water'),
          sql`${foodLogs.loggedAt} >= ${startOfDay}`,
          sql`${foodLogs.loggedAt} <= ${endOfDay}`,
        ),
      )
      .limit(1);

    let resultLog;
    if (existing) {
      [resultLog] = await this.db
        .update(foodLogs)
        .set({
          portion: `${glassCount}`,
          notes: `${glassCount * 250}ml`,
        })
        .where(eq(foodLogs.id, existing.id))
        .returning();
    } else {
      [resultLog] = await this.db
        .insert(foodLogs)
        .values({
          userId,
          mealType: 'water',
          foodName: 'Air Putih',
          portion: `${glassCount}`,
          notes: `${glassCount * 250}ml`,
          calories: '0.00',
          proteinG: '0.00',
          carbsG: '0.00',
          fatG: '0.00',
          loggedAt: targetDate,
          source: 'manual',
        })
        .returning();
    }

    return {
      count: Number(resultLog.portion),
      volumeMl: Number(resultLog.portion) * 250,
    };
  }

  async getWaterLog(userId: string, query: any) {
    const { date } = query;

    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [waterLog] = await this.db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          eq(foodLogs.mealType, 'water'),
          sql`${foodLogs.loggedAt} >= ${startOfDay}`,
          sql`${foodLogs.loggedAt} <= ${endOfDay}`,
        ),
      )
      .limit(1);

    const glassCount = waterLog ? Number(waterLog.portion) : 0;

    return {
      count: glassCount,
      volumeMl: glassCount * 250,
      target: 8,
    };
  }
}
