import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import logger from '../config/logger.js';

/**
 * Food Controller
 * Handles food search, lookup, and nutrition information
 */

/**
 * Search foods by name
 * GET /api/v1/foods/search?q=nasi&category=grains&limit=20
 */
export async function searchFoods(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { q, category, limit = '20', offset = '0' } = req.query;
    
    const searchQuery = (q as string)?.toLowerCase().trim() || '';
    const categoryFilter = category as string | undefined;
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const offsetNum = parseInt(offset as string) || 0;
    
    logger.info(`Searching foods: query="${searchQuery}", category="${categoryFilter}"`);
    
    // Build where clause
    const whereClause: any = {};
    
    if (searchQuery) {
      whereClause.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { commonNames: { has: searchQuery } },
      ];
    }
    
    if (categoryFilter) {
      whereClause.category = categoryFilter;
    }
    
    // Execute search
    const [foods, totalCount] = await Promise.all([
      prisma.localFood.findMany({
        where: whereClause,
        take: limitNum,
        skip: offsetNum,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          category: true,
          origin: true,
          calories: true,
          proteinG: true,
          carbsG: true,
          fatG: true,
          fiberG: true,
          sodiumMg: true,
          sugarG: true,
          isVegetarian: true,
          isVegan: true,
          isHalal: true,
          benefits: true,
        },
      }),
      prisma.localFood.count({ where: whereClause }),
    ]);
    
    res.json({
      success: true,
      data: foods,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + foods.length < totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get food by ID
 * GET /api/v1/foods/:id
 */
export async function getFoodById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    
    const food = await prisma.localFood.findUnique({
      where: { id },
    });
    
    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found',
      });
    }
    
    res.json({
      success: true,
      data: food,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all food categories
 * GET /api/v1/foods/categories
 */
export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = await prisma.localFood.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        category: 'asc',
      },
    });
    
    res.json({
      success: true,
      data: categories.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get foods by category
 * GET /api/v1/foods/category/:category
 */
export async function getFoodsByCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { category } = req.params;
    const { limit = '50', offset = '0' } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;
    
    const [foods, totalCount] = await Promise.all([
      prisma.localFood.findMany({
        where: { category },
        take: limitNum,
        skip: offsetNum,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          category: true,
          calories: true,
          proteinG: true,
          carbsG: true,
          fatG: true,
          isVegetarian: true,
          isVegan: true,
          isHalal: true,
        },
      }),
      prisma.localFood.count({ where: { category } }),
    ]);
    
    res.json({
      success: true,
      data: foods,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + foods.length < totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get nutrition info for multiple foods (for meal calculation)
 * POST /api/v1/foods/nutrition
 * Body: { foodIds: ["id1", "id2", ...] }
 */
export async function getNutritionBulk(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { foodIds } = req.body;
    
    if (!Array.isArray(foodIds) || foodIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'foodIds array is required',
      });
    }
    
    const foods = await prisma.localFood.findMany({
      where: {
        id: { in: foodIds },
      },
      select: {
        id: true,
        name: true,
        calories: true,
        proteinG: true,
        carbsG: true,
        fatG: true,
        fiberG: true,
        sodiumMg: true,
        sugarG: true,
        cholesterolMg: true,
        isVegetarian: true,
        isVegan: true,
        isHalal: true,
        contraindications: true,
      },
    });
    
    res.json({
      success: true,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get random foods for suggestions
 * GET /api/v1/foods/suggestions?category=proteins&limit=5
 */
export async function getFoodSuggestions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { category, vegetarian, vegan, halal, limit = '5' } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string) || 5, 20);
    
    // Build where clause based on filters
    const whereClause: any = {};
    
    if (category) {
      whereClause.category = category;
    }
    if (vegetarian === 'true') {
      whereClause.isVegetarian = true;
    }
    if (vegan === 'true') {
      whereClause.isVegan = true;
    }
    if (halal === 'true') {
      whereClause.isHalal = true;
    }
    
    // Get total count for random selection
    const totalCount = await prisma.localFood.count({ where: whereClause });
    
    if (totalCount === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }
    
    // Random offset for variety
    const randomOffset = Math.floor(Math.random() * Math.max(1, totalCount - limitNum));
    
    const foods = await prisma.localFood.findMany({
      where: whereClause,
      take: limitNum,
      skip: randomOffset,
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
    
    res.json({
      success: true,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get food statistics
 * GET /api/v1/foods/stats
 */
export async function getFoodStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const [totalFoods, categoryCounts, vegetarianCount, veganCount] = await Promise.all([
      prisma.localFood.count(),
      prisma.localFood.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
      prisma.localFood.count({ where: { isVegetarian: true } }),
      prisma.localFood.count({ where: { isVegan: true } }),
    ]);
    
    res.json({
      success: true,
      data: {
        totalFoods,
        categories: categoryCounts.reduce((acc, c) => {
          acc[c.category] = c._count.id;
          return acc;
        }, {} as Record<string, number>),
        vegetarianFoods: vegetarianCount,
        veganFoods: veganCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Search foods matching dietary restrictions and medical conditions
 * POST /api/v1/foods/filter
 * Body: { 
 *   medicalConditions: ["Hipertensi", "Diabetes"],
 *   dietaryRestrictions: ["vegetarian", "halal"],
 *   category: "proteins",
 *   limit: 20
 * }
 */
export async function filterFoods(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { 
      medicalConditions = [], 
      dietaryRestrictions = [], 
      category,
      limit = 20 
    } = req.body;
    
    const limitNum = Math.min(limit, 100);
    
    // Build where clause
    const whereClause: any = {};
    
    if (category) {
      whereClause.category = category;
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
    
    // Get foods
    let foods = await prisma.localFood.findMany({
      where: whereClause,
      take: limitNum * 2, // Get more to filter further
      orderBy: { name: 'asc' },
    });
    
    // Filter by medical conditions
    if (medicalConditions.length > 0) {
      foods = foods.filter(food => {
        // Check if food has contraindications for any of the medical conditions
        const contraindications = food.contraindications as any[];
        if (!contraindications || !Array.isArray(contraindications)) {
          return true;
        }
        
        // Check if any medical condition is contraindicated with high severity
        const hasHighSeverity = contraindications.some(c => 
          medicalConditions.includes(c.condition) && c.severity === 'avoid'
        );
        
        return !hasHighSeverity;
      });
      
      // For Hipertensi, filter out high sodium foods
      if (medicalConditions.includes('Hipertensi')) {
        foods = foods.filter(food => 
          food.sodiumMg === null || Number(food.sodiumMg) < 500
        );
      }
      
      // For Diabetes, filter out high sugar foods
      if (medicalConditions.includes('Diabetes')) {
        foods = foods.filter(food => 
          food.sugarG === null || Number(food.sugarG) < 10
        );
      }
    }
    
    // Limit final result
    foods = foods.slice(0, limitNum);
    
    res.json({
      success: true,
      data: foods,
      filters: {
        medicalConditions,
        dietaryRestrictions,
        category,
      },
    });
  } catch (error) {
    next(error);
  }
}
