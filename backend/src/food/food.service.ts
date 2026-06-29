import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema.js';
import { localFoods } from '../db/schema.js';
import { eq, and, or, ilike, sql, inArray, count } from 'drizzle-orm';

@Injectable()
export class FoodService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  async searchFoods(query: any) {
    const { q, category, limit = '20', offset = '0' } = query;

    const searchQuery = (q as string)?.toLowerCase().trim() || '';
    const categoryFilter = category as string | undefined;
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const offsetNum = parseInt(offset as string, 10) || 0;

    const searchLike = `%${searchQuery}%`;
    const conditions: any[] = [];

    if (searchQuery) {
      conditions.push(
        or(
          ilike(localFoods.name, searchLike),
          sql`${localFoods.commonNames}::text ilike ${searchLike}`,
        ),
      );
    }

    if (categoryFilter) {
      conditions.push(eq(localFoods.category, categoryFilter));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Execute queries
    const foods = await this.db
      .select({
        id: localFoods.id,
        name: localFoods.name,
        category: localFoods.category,
        origin: localFoods.origin,
        calories: localFoods.calories,
        proteinG: localFoods.proteinG,
        carbsG: localFoods.carbsG,
        fatG: localFoods.fatG,
        fiberG: localFoods.fiberG,
        sodiumMg: localFoods.sodiumMg,
        sugarG: localFoods.sugarG,
        isVegetarian: localFoods.isVegetarian,
        isVegan: localFoods.isVegan,
        isHalal: localFoods.isHalal,
        benefits: localFoods.benefits,
      })
      .from(localFoods)
      .where(whereClause)
      .limit(limitNum)
      .offset(offsetNum)
      .orderBy(localFoods.name);

    const [countResult] = await this.db
      .select({ total: count() })
      .from(localFoods)
      .where(whereClause);

    const totalCount = countResult?.total || 0;

    return {
      foods,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + foods.length < totalCount,
      },
    };
  }

  async getFoodById(id: string) {
    const [food] = await this.db
      .select()
      .from(localFoods)
      .where(eq(localFoods.id, id))
      .limit(1);

    if (!food) {
      throw new NotFoundException('Food not found');
    }

    return food;
  }

  async getCategories() {
    const categories = await this.db
      .select({
        category: localFoods.category,
        count: count(localFoods.id),
      })
      .from(localFoods)
      .groupBy(localFoods.category)
      .orderBy(localFoods.category);

    return categories;
  }

  async getFoodsByCategory(category: string, query: any) {
    const { limit = '50', offset = '0' } = query;
    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
    const offsetNum = parseInt(offset as string, 10) || 0;

    const foods = await this.db
      .select({
        id: localFoods.id,
        name: localFoods.name,
        category: localFoods.category,
        calories: localFoods.calories,
        proteinG: localFoods.proteinG,
        carbsG: localFoods.carbsG,
        fatG: localFoods.fatG,
        isVegetarian: localFoods.isVegetarian,
        isVegan: localFoods.isVegan,
        isHalal: localFoods.isHalal,
      })
      .from(localFoods)
      .where(eq(localFoods.category, category))
      .limit(limitNum)
      .offset(offsetNum)
      .orderBy(localFoods.name);

    const [countResult] = await this.db
      .select({ total: count() })
      .from(localFoods)
      .where(eq(localFoods.category, category));

    const totalCount = countResult?.total || 0;

    return {
      foods,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + foods.length < totalCount,
      },
    };
  }

  async getNutritionBulk(body: any) {
    const { foodIds } = body;

    if (!Array.isArray(foodIds) || foodIds.length === 0) {
      throw new BadRequestException('foodIds array is required');
    }

    const foods = await this.db
      .select({
        id: localFoods.id,
        name: localFoods.name,
        calories: localFoods.calories,
        proteinG: localFoods.proteinG,
        carbsG: localFoods.carbsG,
        fatG: localFoods.fatG,
        fiberG: localFoods.fiberG,
        sodiumMg: localFoods.sodiumMg,
        sugarG: localFoods.sugarG,
        cholesterolMg: localFoods.cholesterolMg,
        isVegetarian: localFoods.isVegetarian,
        isVegan: localFoods.isVegan,
        isHalal: localFoods.isHalal,
        contraindications: localFoods.contraindications,
      })
      .from(localFoods)
      .where(inArray(localFoods.id, foodIds));

    return foods;
  }

  async getFoodSuggestions(query: any) {
    const { category, vegetarian, vegan, halal, limit = '5' } = query;
    const limitNum = Math.min(parseInt(limit as string, 10) || 5, 20);

    const conditions: any[] = [];
    if (category) conditions.push(eq(localFoods.category, category));
    if (vegetarian === 'true')
      conditions.push(eq(localFoods.isVegetarian, true));
    if (vegan === 'true') conditions.push(eq(localFoods.isVegan, true));
    if (halal === 'true') conditions.push(eq(localFoods.isHalal, true));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await this.db
      .select({ total: count() })
      .from(localFoods)
      .where(whereClause);

    const totalCount = countResult?.total || 0;

    if (totalCount === 0) {
      return [];
    }

    const randomOffset = Math.floor(
      Math.random() * Math.max(1, totalCount - limitNum),
    );

    const foods = await this.db
      .select({
        id: localFoods.id,
        name: localFoods.name,
        category: localFoods.category,
        calories: localFoods.calories,
        proteinG: localFoods.proteinG,
        carbsG: localFoods.carbsG,
        fatG: localFoods.fatG,
        benefits: localFoods.benefits,
      })
      .from(localFoods)
      .where(whereClause)
      .limit(limitNum)
      .offset(randomOffset);

    return foods;
  }

  async getFoodStats() {
    const [totalResult] = await this.db
      .select({ total: count() })
      .from(localFoods);
    const totalFoods = totalResult?.total || 0;

    const categoryCounts = await this.db
      .select({
        category: localFoods.category,
        count: count(localFoods.id),
      })
      .from(localFoods)
      .groupBy(localFoods.category);

    const [vegResult] = await this.db
      .select({ total: count() })
      .from(localFoods)
      .where(eq(localFoods.isVegetarian, true));
    const vegetarianFoods = vegResult?.total || 0;

    const [veganResult] = await this.db
      .select({ total: count() })
      .from(localFoods)
      .where(eq(localFoods.isVegan, true));
    const veganFoods = veganResult?.total || 0;

    return {
      totalFoods,
      categories: categoryCounts.reduce(
        (acc, c) => {
          acc[c.category] = c.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      vegetarianFoods,
      veganFoods,
    };
  }

  async filterFoods(body: any) {
    const {
      medicalConditions = [],
      dietaryRestrictions = [],
      category,
      limit = 20,
    } = body;
    const limitNum = Math.min(limit, 100);

    const conditions: any[] = [];
    if (category) {
      conditions.push(eq(localFoods.category, category));
    }

    if (dietaryRestrictions.includes('vegetarian')) {
      conditions.push(eq(localFoods.isVegetarian, true));
    }
    if (dietaryRestrictions.includes('vegan')) {
      conditions.push(eq(localFoods.isVegan, true));
    }
    if (dietaryRestrictions.includes('halal')) {
      conditions.push(eq(localFoods.isHalal, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch double the limit to allow filtering in JS
    let foods = await this.db
      .select()
      .from(localFoods)
      .where(whereClause)
      .limit(limitNum * 2)
      .orderBy(localFoods.name);

    // Apply medical condition filtering
    if (medicalConditions.length > 0) {
      foods = foods.filter((food) => {
        const contraindications = food.contraindications as any[];
        if (!contraindications || !Array.isArray(contraindications)) {
          return true;
        }

        const hasHighSeverity = contraindications.some(
          (c) =>
            medicalConditions.includes(c.condition) && c.severity === 'avoid',
        );

        return !hasHighSeverity;
      });

      if (medicalConditions.includes('Hipertensi')) {
        foods = foods.filter(
          (food) => food.sodiumMg === null || Number(food.sodiumMg) < 500,
        );
      }

      if (medicalConditions.includes('Diabetes')) {
        foods = foods.filter(
          (food) => food.sugarG === null || Number(food.sugarG) < 10,
        );
      }
    }

    foods = foods.slice(0, limitNum);

    return {
      foods,
      filters: {
        medicalConditions,
        dietaryRestrictions,
        category,
      },
    };
  }
}
