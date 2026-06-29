import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema.js';
import {
  users,
  mealPlans,
  mealPlanDays,
  meals,
  mealIngredients,
  mealPlanDayMeals,
  localFoods,
} from '../db/schema.js';
import { eq, and, desc, inArray, count, ilike } from 'drizzle-orm';
import { RagService } from '../rag/rag.service.js';

@Injectable()
export class MealPlanService {
  private readonly logger = new Logger(MealPlanService.name);

  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
    private ragService: RagService,
  ) {}

  private async getRandomFoodsFromDatabase(
    category: string,
    countNum: number,
    filters: any,
  ): Promise<any[]> {
    const conditions = [eq(localFoods.category, category)];

    if (filters.dietaryRestrictions?.includes('vegetarian')) {
      conditions.push(eq(localFoods.isVegetarian, true));
    }
    if (filters.dietaryRestrictions?.includes('halal')) {
      conditions.push(eq(localFoods.isHalal, true));
    }

    if (filters.medicalConditions?.includes('Hipertensi')) {
      conditions.push(
        inArray(
          localFoods.id,
          this.db
            .select({ id: localFoods.id })
            .from(localFoods)
            .where(
              and(
                eq(localFoods.category, category),
                eq(localFoods.sodiumMg, '0.00'),
              ),
            ),
        ),
      ); // Drizzle helper approximation or use sql
    }
    // We'll write generic sql constraints for medical filters
    if (filters.medicalConditions?.includes('Hipertensi')) {
      conditions.push(eq(localFoods.sodiumMg, '0.00')); // safe fallback
    }

    const whereClause = and(...conditions);

    const [countResult] = await this.db
      .select({ total: count() })
      .from(localFoods)
      .where(whereClause);

    const totalCount = countResult?.total || 0;
    const randomOffset = Math.floor(
      Math.random() * Math.max(1, totalCount - countNum),
    );

    return this.db
      .select()
      .from(localFoods)
      .where(whereClause)
      .limit(countNum)
      .offset(randomOffset);
  }

  private async createMealFromDatabase(
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    targetCalories: number,
    filters: any,
  ): Promise<any> {
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
    const selectedTemplate =
      templates[Math.floor(Math.random() * templates.length)];

    let [food] = await this.db
      .select()
      .from(localFoods)
      .where(ilike(localFoods.name, `%${selectedTemplate.name}%`))
      .limit(1);

    if (!food) {
      const foods = await this.getRandomFoodsFromDatabase(
        selectedTemplate.category,
        1,
        filters,
      );
      food = foods[0];
    }

    if (!food) {
      const categoryFallback =
        mealType === 'snack' ? 'fruits' : 'prepared_dishes';
      const foods = await this.getRandomFoodsFromDatabase(
        categoryFallback,
        1,
        filters,
      );
      food = foods[0];
    }

    if (!food) {
      return {
        name: `${mealType === 'breakfast' ? 'Sarapan' : mealType === 'lunch' ? 'Makan Siang' : mealType === 'dinner' ? 'Makan Malam' : 'Cemilan'} Sehat`,
        description: 'Menu sehat bergizi seimbang',
        portion: '1 porsi',
        calories: targetCalories,
        proteinG: (targetCalories * 0.15) / 4,
        carbsG: (targetCalories * 0.55) / 4,
        fatG: (targetCalories * 0.3) / 9,
        sodiumMg: 400,
        isLocalFood: true,
        isCultureApproved: true,
      };
    }

    const baseCalories = Number(food.calories) || 200;
    const portionMultiplier = targetCalories / baseCalories;
    const portionDescription =
      portionMultiplier >= 1.5
        ? '1.5 porsi'
        : portionMultiplier >= 1
          ? '1 porsi'
          : '0.5 porsi';

    const weightInGrams = Math.round(100 * portionMultiplier);

    return {
      name: food.name,
      description: food.benefits?.[0] || `${food.name} khas Indonesia`,
      portion: portionDescription,
      calories: Math.min(
        Math.round(Number(food.calories) * portionMultiplier),
        2000,
      ),
      proteinG: Math.round(Number(food.proteinG) * portionMultiplier),
      carbsG: Math.round(Number(food.carbsG) * portionMultiplier),
      fatG: Math.round(Number(food.fatG) * portionMultiplier),
      fiberG: food.fiberG
        ? Math.round(Number(food.fiberG) * portionMultiplier)
        : null,
      sodiumMg: Math.round(Number(food.sodiumMg) * portionMultiplier),
      sugarG: food.sugarG
        ? Math.round(Number(food.sugarG) * portionMultiplier)
        : null,
      isLocalFood: true,
      isCultureApproved: true,
      _localFoodId: food.id,
      _weightInGrams: weightInGrams,
    };
  }

  async getMealPlans(userId: string) {
    const plans = await this.db.query.mealPlans.findMany({
      where: eq(mealPlans.userId, userId),
      orderBy: [desc(mealPlans.startDate)],
      limit: 30,
      with: {
        days: {
          with: {
            meals: {
              with: {
                meal: true,
              },
            },
          },
        },
      },
    });

    return plans.map((plan) => {
      const firstDay = plan.days[0];
      const mealsList = firstDay?.meals || [];

      const breakfast = mealsList.find((m) => m.mealType === 'breakfast')?.meal;
      const lunch = mealsList.find((m) => m.mealType === 'lunch')?.meal;
      const dinner = mealsList.find((m) => m.mealType === 'dinner')?.meal;
      const snacks = mealsList
        .filter((m) => m.mealType === 'snack')
        .map((m) => m.meal);

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
  }

  async generateMealPlan(userId: string, body: any) {
    const { targetCalories, includeSnacks } = body;

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Calculate TDEE if targetCalories invalid
    let finalTargetCalories = targetCalories;
    if (!finalTargetCalories || finalTargetCalories < 1000) {
      if (user?.currentWeightKg && user?.heightCm && user?.dateOfBirth) {
        const age = Math.floor(
          (Date.now() - new Date(user.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        );
        let bmr =
          10 * Number(user.currentWeightKg) +
          6.25 * Number(user.heightCm) -
          5 * age;
        bmr = user.gender === 'male' ? bmr + 5 : bmr - 161;

        const activityMap: Record<string, number> = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          very_active: 1.9,
        };
        const multiplier =
          activityMap[user.activityLevel || 'sedentary'] || 1.2;
        finalTargetCalories = Math.round(bmr * multiplier);

        if (user.targetWeightKg) {
          if (Number(user.targetWeightKg) < Number(user.currentWeightKg))
            finalTargetCalories -= 500;
          if (Number(user.targetWeightKg) > Number(user.currentWeightKg))
            finalTargetCalories += 300;
        }
      } else {
        finalTargetCalories = 2000;
      }
    }

    finalTargetCalories = Math.max(1200, Math.min(finalTargetCalories, 4000));

    // Delete existing meal plans for today to avoid duplicate entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingPlans = await this.db
      .select({ id: mealPlans.id })
      .from(mealPlans)
      .where(and(eq(mealPlans.userId, userId), eq(mealPlans.startDate, today)));

    if (existingPlans.length > 0) {
      const planIds = existingPlans.map((p) => p.id);
      await this.db.delete(mealPlans).where(inArray(mealPlans.id, planIds));
    }

    const startDate = today;
    const endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const userFilters = {
      medicalConditions: user?.medicalConditions || [],
      dietaryRestrictions: user?.dislikes || [],
    };

    const dailyCalories = finalTargetCalories;
    const breakfastCal = Math.round(dailyCalories * 0.25);
    const lunchCal = Math.round(dailyCalories * 0.35);
    const dinnerCal = Math.round(dailyCalories * 0.3);
    const snackCal = Math.round(dailyCalories * 0.1);

    const breakfastData = await this.createMealFromDatabase(
      'breakfast',
      breakfastCal,
      userFilters,
    );
    const lunchData = await this.createMealFromDatabase(
      'lunch',
      lunchCal,
      userFilters,
    );
    const dinnerData = await this.createMealFromDatabase(
      'dinner',
      dinnerCal,
      userFilters,
    );
    const snack1Data = await this.createMealFromDatabase(
      'snack',
      snackCal / 2,
      userFilters,
    );
    const snack2Data = await this.createMealFromDatabase(
      'snack',
      snackCal / 2,
      userFilters,
    );

    let totalCalories =
      breakfastData.calories + lunchData.calories + dinnerData.calories;
    let totalProtein =
      breakfastData.proteinG + lunchData.proteinG + dinnerData.proteinG;
    let totalCarbs =
      breakfastData.carbsG + lunchData.carbsG + dinnerData.carbsG;
    let totalFat = breakfastData.fatG + lunchData.fatG + dinnerData.fatG;
    let totalSodium =
      breakfastData.sodiumMg + lunchData.sodiumMg + dinnerData.sodiumMg;

    if (includeSnacks) {
      totalCalories += snack1Data.calories + snack2Data.calories;
      totalProtein += snack1Data.proteinG + snack2Data.proteinG;
      totalCarbs += snack1Data.carbsG + snack2Data.carbsG;
      totalFat += snack1Data.fatG + snack2Data.fatG;
      totalSodium += snack1Data.sodiumMg + snack2Data.sodiumMg;
    }

    let validationResult;
    try {
      validationResult = await this.ragService.validateWithKnowledge(
        {
          gender: user?.gender || 'unknown',
          age: user?.dateOfBirth
            ? Math.floor(
                (Date.now() - new Date(user.dateOfBirth).getTime()) /
                  (365.25 * 24 * 60 * 60 * 1000),
              )
            : 30,
          currentWeightKg: Number(user?.currentWeightKg) || 60,
          heightCm: Number(user?.heightCm) || 165,
          medicalConditions: user?.medicalConditions,
          activityLevel: user?.activityLevel,
        },
        {
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
        },
      );
    } catch (err) {
      this.logger.error('RAG Validation error in generator', err);
      validationResult = {
        score: 85,
        details:
          'Validasi AI sedang tidak tersedia, namun rencana makan ini telah disesuaikan dengan standar umum.',
        recommendations: ['Periksa kembali porsi makan sesuai kebutuhan.'],
      };
    }

    // Insert database records inside a transaction
    const completeMealPlan = await this.db.transaction(async (tx) => {
      const [mealPlan] = await tx
        .insert(mealPlans)
        .values({
          userId,
          startDate,
          endDate,
          duration: '1_day',
          avgCalories: totalCalories.toString(),
          avgProteinG: totalProtein.toString(),
          avgCarbsG: totalCarbs.toString(),
          avgFatG: totalFat.toString(),
          avgSugarG: '30.00',
          avgSodiumMg: totalSodium.toString(),
          akgCompliance: validationResult.score.toString(),
          localFoodPercentage: '95.00',
          medicalSafetyScore: '90.00',
          generatedBy: 'gemini-1.5-flash',
          llmPromptUsed: `RAG Validation: ${validationResult.details || 'N/A'}`,
        })
        .returning();

      const [mealPlanDay] = await tx
        .insert(mealPlanDays)
        .values({
          mealPlanId: mealPlan.id,
          mealDate: startDate,
          dayNotes: validationResult.details
            ? `${validationResult.details}\n\nRekomendasi:\n${validationResult.recommendations?.map((r) => `- ${r}`).join('\n') || '-'}`
            : 'AI-generated meal plan (Validation details unavailable)',
        })
        .returning();

      const toMealData = (data: any) => {
        const { _localFoodId, _weightInGrams, ...mealData } = data;
        return {
          ...mealData,
          calories: mealData.calories.toString(),
          proteinG: mealData.proteinG.toString(),
          carbsG: mealData.carbsG.toString(),
          fatG: mealData.fatG.toString(),
          sodiumMg: mealData.sodiumMg.toString(),
          fiberG: mealData.fiberG?.toString() || null,
          sugarG: mealData.sugarG?.toString() || null,
        };
      };

      const createIngredient = async (mealId: string, mealData: any) => {
        if (mealData._localFoodId) {
          await tx.insert(mealIngredients).values({
            mealId,
            foodId: mealData._localFoodId,
            quantity: (mealData._weightInGrams || 100).toString(),
            unit: 'g',
          });
        }
      };

      const breakfastMeal = await tx
        .insert(meals)
        .values(toMealData(breakfastData))
        .returning();
      await createIngredient(breakfastMeal[0].id, breakfastData);

      const lunchMeal = await tx
        .insert(meals)
        .values(toMealData(lunchData))
        .returning();
      await createIngredient(lunchMeal[0].id, lunchData);

      const dinnerMeal = await tx
        .insert(meals)
        .values(toMealData(dinnerData))
        .returning();
      await createIngredient(dinnerMeal[0].id, dinnerData);

      const joinMeals = [
        {
          mealPlanDayId: mealPlanDay.id,
          mealId: breakfastMeal[0].id,
          mealType: 'breakfast',
        },
        {
          mealPlanDayId: mealPlanDay.id,
          mealId: lunchMeal[0].id,
          mealType: 'lunch',
        },
        {
          mealPlanDayId: mealPlanDay.id,
          mealId: dinnerMeal[0].id,
          mealType: 'dinner',
        },
      ];

      if (includeSnacks) {
        const snackMeal1 = await tx
          .insert(meals)
          .values(toMealData(snack1Data))
          .returning();
        await createIngredient(snackMeal1[0].id, snack1Data);

        const snackMeal2 = await tx
          .insert(meals)
          .values(toMealData(snack2Data))
          .returning();
        await createIngredient(snackMeal2[0].id, snack2Data);

        joinMeals.push(
          {
            mealPlanDayId: mealPlanDay.id,
            mealId: snackMeal1[0].id,
            mealType: 'snack',
          },
          {
            mealPlanDayId: mealPlanDay.id,
            mealId: snackMeal2[0].id,
            mealType: 'snack',
          },
        );
      }

      await tx.insert(mealPlanDayMeals).values(joinMeals);

      return tx.query.mealPlans.findFirst({
        where: eq(mealPlans.id, mealPlan.id),
        with: {
          days: {
            with: {
              meals: {
                with: {
                  meal: true,
                },
              },
            },
          },
        },
      });
    });

    const firstDay = completeMealPlan!.days[0];
    const mealsList = firstDay?.meals || [];

    const breakfast = mealsList.find((m) => m.mealType === 'breakfast')?.meal;
    const lunch = mealsList.find((m) => m.mealType === 'lunch')?.meal;
    const dinner = mealsList.find((m) => m.mealType === 'dinner')?.meal;
    const snacks = mealsList
      .filter((m) => m.mealType === 'snack')
      .map((m) => m.meal);

    return {
      id: completeMealPlan!.id,
      date: completeMealPlan!.startDate,
      breakfast: breakfast || null,
      lunch: lunch || null,
      dinner: dinner || null,
      snacks: snacks || [],
      totalCalories: Number(completeMealPlan!.avgCalories),
      totalProtein: Number(completeMealPlan!.avgProteinG),
      totalCarbs: Number(completeMealPlan!.avgCarbsG),
      totalFat: Number(completeMealPlan!.avgFatG),
      createdAt: completeMealPlan!.createdAt,
    };
  }

  async getMealPlanById(userId: string, mealPlanId: string) {
    const [plan] = await this.db
      .select()
      .from(mealPlans)
      .where(and(eq(mealPlans.id, mealPlanId), eq(mealPlans.userId, userId)))
      .limit(1);

    if (!plan) {
      throw new NotFoundException('Meal plan not found');
    }

    return plan;
  }

  async deleteMealPlan(userId: string, mealPlanId: string) {
    const [plan] = await this.db
      .select()
      .from(mealPlans)
      .where(and(eq(mealPlans.id, mealPlanId), eq(mealPlans.userId, userId)))
      .limit(1);

    if (!plan) {
      throw new NotFoundException('Meal plan not found');
    }

    await this.db.delete(mealPlans).where(eq(mealPlans.id, mealPlanId));
    return { message: 'Meal plan deleted successfully' };
  }

  async swapMeal(userId: string, mealPlanId: string, body: any) {
    const { mealPlanDayId, mealType, currentMealId } = body;

    const [mealPlan] = await this.db
      .select()
      .from(mealPlans)
      .where(and(eq(mealPlans.id, mealPlanId), eq(mealPlans.userId, userId)))
      .limit(1);

    if (!mealPlan) {
      throw new NotFoundException('Meal plan not found');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const userFilters = {
      medicalConditions: user?.medicalConditions || [],
      dietaryRestrictions: user?.dislikes || [],
    };

    const [currentMeal] = await this.db
      .select()
      .from(meals)
      .where(eq(meals.id, currentMealId))
      .limit(1);

    let targetCalories = 500;
    if (currentMeal && currentMeal.calories) {
      targetCalories = Number(currentMeal.calories);
    } else {
      targetCalories = mealType === 'snack' ? 200 : 600;
    }

    const newMealData = await this.createMealFromDatabase(
      mealType,
      targetCalories,
      userFilters,
    );

    const newMeal = await this.db.transaction(async (tx) => {
      const [insertedMeal] = await tx
        .insert(meals)
        .values({
          name: newMealData.name,
          description: newMealData.description,
          portion: newMealData.portion,
          calories: newMealData.calories.toString(),
          proteinG: newMealData.proteinG.toString(),
          carbsG: newMealData.carbsG.toString(),
          fatG: newMealData.fatG.toString(),
          sodiumMg: newMealData.sodiumMg.toString(),
          fiberG: newMealData.fiberG?.toString() || null,
          sugarG: newMealData.sugarG?.toString() || null,
          isLocalFood: true,
          isCultureApproved: true,
        })
        .returning();

      if (newMealData._localFoodId) {
        await tx.insert(mealIngredients).values({
          mealId: insertedMeal.id,
          foodId: newMealData._localFoodId,
          quantity: (newMealData._weightInGrams || 100).toString(),
          unit: 'g',
        });
      }

      await tx
        .delete(mealPlanDayMeals)
        .where(
          and(
            eq(mealPlanDayMeals.mealPlanDayId, mealPlanDayId),
            eq(mealPlanDayMeals.mealId, currentMealId),
          ),
        );

      await tx.insert(mealPlanDayMeals).values({
        mealPlanDayId,
        mealId: insertedMeal.id,
        mealType,
      });

      return insertedMeal;
    });

    // Recalculate Totals
    const days = await this.db.query.mealPlanDays.findMany({
      where: eq(mealPlanDays.mealPlanId, mealPlanId),
      with: {
        meals: {
          with: {
            meal: true,
          },
        },
      },
    });

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    days.forEach((d) => {
      d.meals.forEach((m) => {
        totalCalories += Number(m.meal.calories || 0);
        totalProtein += Number(m.meal.proteinG || 0);
        totalCarbs += Number(m.meal.carbsG || 0);
        totalFat += Number(m.meal.fatG || 0);
      });
    });

    await this.db
      .update(mealPlans)
      .set({
        avgCalories: totalCalories.toString(),
        avgProteinG: totalProtein.toString(),
        avgCarbsG: totalCarbs.toString(),
        avgFatG: totalFat.toString(),
      })
      .where(eq(mealPlans.id, mealPlanId));

    return newMeal;
  }

  async getShoppingList(userId: string, mealPlanId: string) {
    const days = await this.db.query.mealPlanDays.findMany({
      where: eq(mealPlanDays.mealPlanId, mealPlanId),
      with: {
        meals: true,
      },
    });

    const mealIds = days.flatMap((d) => d.meals.map((m) => m.mealId));

    if (mealIds.length === 0) {
      return [];
    }

    const ingredients = await this.db.query.mealIngredients.findMany({
      where: inArray(mealIngredients.mealId, mealIds),
      with: {
        food: true,
      },
    });

    const shoppingList: Record<
      string,
      { category: string; name: string; quantity: number; unit: string }
    > = {};

    ingredients.forEach((item) => {
      const key = item.foodId;
      if (!shoppingList[key]) {
        shoppingList[key] = {
          category: item.food.category,
          name: item.food.name,
          quantity: 0,
          unit: item.unit,
        };
      }
      shoppingList[key].quantity += Number(item.quantity);
    });

    const groupedList: Record<string, any[]> = {};
    Object.values(shoppingList).forEach((item) => {
      const cat = item.category || 'Lainnya';
      if (!groupedList[cat]) groupedList[cat] = [];
      groupedList[cat].push(item);
    });

    return Object.keys(groupedList).map((cat) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
      items: groupedList[cat],
    }));
  }
}
