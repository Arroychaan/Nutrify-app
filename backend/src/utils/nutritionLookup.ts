import prisma from '../config/prisma.js';
import logger from '../config/logger.js';
import { generateNutritionEstimate } from '../services/llmService.js';

/**
 * Nutrition Lookup Service
 * Provides nutrition data from local database with AI fallback
 */

export interface NutritionData {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sodiumMg?: number;
  sugarG?: number;
  source: 'database' | 'ai_estimated';
  foodId?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isHalal?: boolean;
  contraindications?: any[];
}

/**
 * Search for a food in the database by name
 * Uses fuzzy matching to find similar foods
 */
export async function findFoodByName(name: string): Promise<NutritionData | null> {
  const searchName = name.toLowerCase().trim();
  
  // Try exact match first
  let food = await prisma.localFood.findFirst({
    where: {
      name: { equals: searchName, mode: 'insensitive' },
    },
  });
  
  // Try contains match
  if (!food) {
    food = await prisma.localFood.findFirst({
      where: {
        name: { contains: searchName, mode: 'insensitive' },
      },
    });
  }
  
  // Try word-based search
  if (!food) {
    const words = searchName.split(' ').filter(w => w.length > 2);
    if (words.length > 0) {
      food = await prisma.localFood.findFirst({
        where: {
          OR: words.map(word => ({
            name: { contains: word, mode: 'insensitive' },
          })),
        },
      });
    }
  }
  
  if (food) {
    return {
      name: food.name,
      calories: Number(food.calories),
      proteinG: Number(food.proteinG),
      carbsG: Number(food.carbsG),
      fatG: Number(food.fatG),
      fiberG: food.fiberG ? Number(food.fiberG) : undefined,
      sodiumMg: Number(food.sodiumMg),
      sugarG: food.sugarG ? Number(food.sugarG) : undefined,
      source: 'database',
      foodId: food.id,
      isVegetarian: food.isVegetarian,
      isVegan: food.isVegan,
      isHalal: food.isHalal,
      contraindications: food.contraindications as any[],
    };
  }
  
  return null;
}

/**
 * Get nutrition data for a food, using database first then AI fallback
 */
export async function getNutritionData(
  foodName: string,
  portion: string = '1 porsi'
): Promise<NutritionData> {
  try {
    // First try database lookup
    const dbFood = await findFoodByName(foodName);
    
    if (dbFood) {
      logger.info(`Found food in database: ${dbFood.name}`, {
        originalQuery: foodName,
        foundName: dbFood.name,
      });
      
      // Adjust for portion if needed (database is per 100g)
      // For now return as-is, portion adjustment can be added later
      return dbFood;
    }
    
    // Fallback to AI estimation
    logger.info(`Food not found in database, using AI estimate: ${foodName}`);
    
    const aiEstimate = await generateNutritionEstimate(foodName, portion);
    
    return {
      name: foodName,
      calories: aiEstimate.calories,
      proteinG: aiEstimate.proteinG,
      carbsG: aiEstimate.carbsG,
      fatG: aiEstimate.fatG,
      source: 'ai_estimated',
    };
  } catch (error) {
    logger.error('Error getting nutrition data:', error);
    
    // Return conservative estimate on error
    return {
      name: foodName,
      calories: 200,
      proteinG: 8,
      carbsG: 25,
      fatG: 8,
      source: 'ai_estimated',
    };
  }
}

/**
 * Get nutrition data for multiple foods
 */
export async function getBulkNutritionData(
  foods: Array<{ name: string; portion?: string }>
): Promise<NutritionData[]> {
  const results: NutritionData[] = [];
  
  for (const food of foods) {
    const nutrition = await getNutritionData(food.name, food.portion);
    results.push(nutrition);
  }
  
  return results;
}

/**
 * Get food recommendations based on user conditions
 */
export async function getRecommendedFoods(
  options: {
    medicalConditions?: string[];
    dietaryRestrictions?: string[];
    category?: string;
    maxCalories?: number;
    minProtein?: number;
    limit?: number;
  }
): Promise<any[]> {
  const {
    medicalConditions = [],
    dietaryRestrictions = [],
    category,
    maxCalories,
    minProtein,
    limit = 10,
  } = options;
  
  // Build where clause
  const whereClause: any = {};
  
  if (category) {
    whereClause.category = category;
  }
  
  if (maxCalories) {
    whereClause.calories = { lte: maxCalories };
  }
  
  if (minProtein) {
    whereClause.proteinG = { gte: minProtein };
  }
  
  // Apply dietary restrictions
  if (dietaryRestrictions.includes('vegetarian')) {
    whereClause.isVegetarian = true;
  }
  if (dietaryRestrictions.includes('vegan')) {
    whereClause.isVegan = true;
  }
  if (dietaryRestrictions.includes('halal')) {
    whereClause.isHalal = true;
  }
  
  // Apply medical condition filters
  if (medicalConditions.includes('Hipertensi')) {
    whereClause.sodiumMg = { lt: 500 };
  }
  if (medicalConditions.includes('Diabetes')) {
    whereClause.sugarG = { lt: 10 };
  }
  
  const foods = await prisma.localFood.findMany({
    where: whereClause,
    take: limit,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      category: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
      sodiumMg: true,
      sugarG: true,
      benefits: true,
      isVegetarian: true,
      isVegan: true,
      isHalal: true,
    },
  });
  
  return foods;
}

/**
 * Check if a food is safe for user's medical conditions
 */
export async function isFoodSafe(
  foodName: string,
  medicalConditions: string[]
): Promise<{ safe: boolean; warnings: string[] }> {
  const food = await findFoodByName(foodName);
  
  if (!food) {
    return { safe: true, warnings: ['Makanan tidak ditemukan dalam database, periksa manual'] };
  }
  
  const warnings: string[] = [];
  let safe = true;
  
  // Check contraindications
  if (food.contraindications && Array.isArray(food.contraindications)) {
    for (const contraindication of food.contraindications) {
      if (medicalConditions.includes(contraindication.condition)) {
        if (contraindication.severity === 'avoid') {
          safe = false;
          warnings.push(`⚠️ ${food.name} harus dihindari untuk ${contraindication.condition}: ${contraindication.reason}`);
        } else if (contraindication.severity === 'caution') {
          warnings.push(`⚡ ${food.name} perlu hati-hati untuk ${contraindication.condition}: ${contraindication.reason}`);
        }
      }
    }
  }
  
  // Check sodium for hypertension
  if (medicalConditions.includes('Hipertensi') && food.sodiumMg && food.sodiumMg > 600) {
    warnings.push(`⚠️ ${food.name} tinggi sodium (${food.sodiumMg}mg) - tidak disarankan untuk hipertensi`);
    if (food.sodiumMg > 800) {
      safe = false;
    }
  }
  
  // Check sugar for diabetes
  if (medicalConditions.includes('Diabetes') && food.sugarG && food.sugarG > 15) {
    warnings.push(`⚠️ ${food.name} tinggi gula (${food.sugarG}g) - tidak disarankan untuk diabetes`);
    if (food.sugarG > 20) {
      safe = false;
    }
  }
  
  return { safe, warnings };
}

/**
 * Get similar foods (for substitution)
 */
export async function getSimilarFoods(
  foodName: string,
  medicalConditions: string[] = []
): Promise<any[]> {
  const originalFood = await findFoodByName(foodName);
  
  if (!originalFood || !originalFood.foodId) {
    return [];
  }
  
  const original = await prisma.localFood.findUnique({
    where: { id: originalFood.foodId },
  });
  
  if (!original) {
    return [];
  }
  
  // Find foods in same category with similar macros
  const whereClause: any = {
    category: original.category,
    id: { not: original.id },
  };
  
  // Apply medical condition filters
  if (medicalConditions.includes('Hipertensi')) {
    whereClause.sodiumMg = { lt: 500 };
  }
  if (medicalConditions.includes('Diabetes')) {
    whereClause.sugarG = { lt: 10 };
  }
  
  const similarFoods = await prisma.localFood.findMany({
    where: whereClause,
    take: 5,
    orderBy: { calories: 'asc' },
    select: {
      id: true,
      name: true,
      category: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
      benefits: true,
    },
  });
  
  return similarFoods;
}

/**
 * Get all foods in database as a list for LLM context
 */
export async function getFoodListForLLM(
  limit: number = 100
): Promise<string> {
  const foods = await prisma.localFood.findMany({
    take: limit,
    orderBy: { name: 'asc' },
    select: {
      name: true,
      category: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
    },
  });
  
  const foodList = foods.map(f => 
    `${f.name} (${f.category}): ${f.calories}kcal, P:${f.proteinG}g, K:${f.carbsG}g, L:${f.fatG}g`
  ).join('\n');
  
  return foodList;
}
