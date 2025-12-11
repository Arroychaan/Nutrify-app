import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '@config/index.js';
import logger from '@config/logger.js';
import prisma from '@config/prisma.js';

let geminiClient: GoogleGenerativeAI;

export function getGeminiInstance(): GoogleGenerativeAI {
  if (!geminiClient) {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    geminiClient = new GoogleGenerativeAI(config.gemini.apiKey);
  }
  return geminiClient;
}

export interface MealPlanGenerationRequest {
  userId: string;
  culture: string;
  medicalConditions: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  calorieTarget: number;
  duration: string; // 1_day, 3_days, 7_days, etc
  budget?: number; // in Rp
  preferences?: Record<string, any>;
}

/**
 * Generate meal plan using Gemini AI
 */
export async function generateMealPlan(
  request: MealPlanGenerationRequest
): Promise<any> {
  try {
    const client = getGeminiInstance();
    
    // Using the model from config (default: gemini-2.0-flash)
    const modelName = config.gemini.model;
    const model = client.getGenerativeModel({ model: modelName });

    const prompt = buildMealPlanPrompt(request);
    
    // Get food database context
    const foodDatabaseContext = await getFoodDatabaseContext(request);
    
    const systemPrompt = `You are Nutrify, an expert AI Dietician specializing in Indonesian nutrition and traditional medicine.
      
Your responsibilities:
1. Provide personalized meal plans using LOCAL Indonesian foods
2. Ensure ALL recommendations comply with AKG (Angka Kecukupan Gizi) - Indonesian Dietary Guidelines
3. Never recommend foods that worsen medical conditions
4. Prioritize affordable, accessible foods with cultural significance
5. Respond with valid JSON only (no markdown, no extra text)

${foodDatabaseContext}

When generating meal plans, return ONLY a JSON object with this exact structure:
{
  "mealPlan": {
    "breakfast": {"name": "", "portion": "", "nutrition": {}},
    "lunch": {"name": "", "portion": "", "nutrition": {}},
    "dinner": {"name": "", "portion": "", "nutrition": {}},
    "dayNotes": ""
  }
}

${prompt}`;

    logger.info('Calling Gemini AI for meal plan generation', {
      userId: request.userId,
      duration: request.duration,
      model: modelName,
    });

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    const mealPlanData = JSON.parse(cleanText);

    logger.info('Meal plan generated successfully', {
      userId: request.userId,
      model: modelName,
    });

    return {
      mealPlan: mealPlanData,
      model: modelName,
    };
  } catch (error) {
    logger.error('Error generating meal plan:', error);
    throw error;
  }
}

/**
 * Chat with Gemini AI for nutrition Q&A
 */
export async function chatWithGemini(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemContext?: Record<string, any>
): Promise<any> {
  try {
    const client = getGeminiInstance();
    
    // Using the model from config (default: gemini-2.0-flash)
    const modelName = config.gemini.model;
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: buildSystemPrompt(systemContext),
    });

    const conversationHistory = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: conversationHistory.slice(0, -1),
    });

    const lastMessage = messages[messages.length - 1].content;

    const result = await chat.sendMessage(lastMessage);
    const response = result.response;
    const text = response.text();

    return {
      message: text,
      model: modelName,
    };
  } catch (error) {
    logger.error('Error in Gemini chat:', error);
    throw error;
  }
}

function buildMealPlanPrompt(request: MealPlanGenerationRequest): string {
  return `Generate a meal plan for:
- Culture: ${request.culture}
- Medical conditions: ${request.medicalConditions.join(', ') || 'None'}
- Allergies: ${request.allergies.join(', ') || 'None'}
- Dietary restrictions: ${request.dietaryRestrictions.join(', ') || 'None'}
- Daily calorie target: ${request.calorieTarget} kcal
- Duration: ${request.duration}
- Budget: ${request.budget ? `Rp ${request.budget}/day` : 'No limit'}

Requirements:
1. Use 60%+ local Indonesian foods
2. Comply with AKG guidelines
3. Respect medical conditions and allergies
4. Stay within budget if provided
5. Include cultural significance

Generate meal plan with detailed nutrition information per meal.`;
}

function buildSystemPrompt(context?: Record<string, any>): string {
  let prompt = `You are Nutrify, an expert AI Dietician specializing in Indonesian nutrition.
You are a personal nutritionist who KNOWS the user personally and has access to their complete health profile.

Your expertise includes:
- AKG (Angka Kecukupan Gizi) - Indonesian Dietary Guidelines
- Local Indonesian cuisine from various regions (Jawa, Sunda, Minang, Bugis, Batak, Bali, etc)
- Medical nutrition therapy for chronic conditions
- Cultural and religious dietary practices
- Budget-conscious meal planning

Guidelines:
- ALWAYS address the user by their name when appropriate
- Reference their specific health data when giving advice
- Always prioritize user safety (never recommend foods that worsen their conditions)
- Use simple Indonesian language (Bahasa Indonesia)
- Provide personalized recommendations based on their profile
- Consider their cultural and religious preferences
- Track their daily calorie intake and remind them of their progress
`;

  if (context) {
    // User Identity
    if (context.userName) {
      prompt += `\n\n=== PROFIL PENGGUNA ===`;
      prompt += `\nNama: ${context.userName}`;
    }
    if (context.gender) {
      prompt += `\nJenis Kelamin: ${context.gender === 'male' ? 'Laki-laki' : 'Perempuan'}`;
    }
    if (context.age) {
      prompt += `\nUsia: ${context.age} tahun`;
    }

    // Physical Metrics
    if (context.heightCm || context.currentWeightKg) {
      prompt += `\n\n=== METRIK FISIK ===`;
      if (context.heightCm) prompt += `\nTinggi: ${context.heightCm} cm`;
      if (context.currentWeightKg) prompt += `\nBerat saat ini: ${context.currentWeightKg} kg`;
      if (context.targetWeightKg) prompt += `\nTarget berat: ${context.targetWeightKg} kg`;
      if (context.bmi) prompt += `\nBMI: ${context.bmi}`;
      if (context.activityLevel) prompt += `\nLevel aktivitas: ${context.activityLevel}`;
    }

    // Health Conditions
    if (context.medicalConditions?.length > 0 || context.allergies?.length > 0 || context.medications?.length > 0) {
      prompt += `\n\n=== KONDISI KESEHATAN ===`;
      if (context.medicalConditions?.length > 0) {
        prompt += `\nKondisi medis: ${context.medicalConditions.join(', ')}`;
      }
      if (context.medications?.length > 0) {
        prompt += `\nObat yang dikonsumsi: ${context.medications.join(', ')}`;
      }
      if (context.allergies?.length > 0) {
        prompt += `\nAlergi: ${context.allergies.join(', ')}`;
      }
    }

    // Preferences
    if (context.culture || context.religion || context.dietaryRestrictions?.length > 0 || context.dislikes?.length > 0) {
      prompt += `\n\n=== PREFERENSI ===`;
      if (context.culture) prompt += `\nBudaya: ${context.culture}`;
      if (context.religion) prompt += `\nAgama: ${context.religion}`;
      if (context.dietaryRestrictions?.length > 0) {
        prompt += `\nPantangan diet: ${context.dietaryRestrictions.join(', ')}`;
      }
      if (context.dislikes?.length > 0) {
        prompt += `\nMakanan tidak disukai: ${context.dislikes.join(', ')}`;
      }
    }

    // Today's Progress
    if (context.calorieTarget) {
      prompt += `\n\n=== PROGRESS HARI INI ===`;
      prompt += `\nTarget kalori harian: ${context.calorieTarget} kcal`;
      prompt += `\nKalori sudah dikonsumsi: ${context.todayCaloriesConsumed || 0} kcal`;
      prompt += `\nSisa kalori: ${context.todayCaloriesRemaining || context.calorieTarget} kcal`;
      prompt += `\nJumlah makanan dicatat: ${context.todayMealsLogged || 0}`;
      if (context.todayFoodLog?.length > 0) {
        prompt += `\nMakanan hari ini: ${context.todayFoodLog.join(', ')}`;
      }
    }

    // Latest Biomarkers
    if (context.latestBiomarker) {
      prompt += `\n\n=== BIOMARKER TERAKHIR ===`;
      if (context.latestBiomarker.bloodGlucose) {
        prompt += `\nGula darah: ${context.latestBiomarker.bloodGlucose} mg/dL`;
      }
      if (context.latestBiomarker.bloodPressure) {
        prompt += `\nTekanan darah: ${context.latestBiomarker.bloodPressure} mmHg`;
      }
      if (context.latestBiomarker.cholesterol) {
        prompt += `\nKolesterol total: ${context.latestBiomarker.cholesterol} mg/dL`;
      }
    }

    // Engagement
    if (context.streakDays > 0) {
      prompt += `\n\nStreak pengguna: ${context.streakDays} hari berturut-turut 🔥`;
    }
  }

  return prompt;
}

/**
 * Generate nutrition estimate for a food item using AI
 */
export async function generateNutritionEstimate(
  foodName: string,
  portion: string
): Promise<{ calories: number; proteinG: number; carbsG: number; fatG: number }> {
  try {
    const client = getGeminiInstance();
    const modelName = config.gemini.model;
    const model = client.getGenerativeModel({ model: modelName });

    const prompt = `Estimate the nutrition for this Indonesian food:
Food: ${foodName}
Portion: ${portion}

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{"calories": number, "proteinG": number, "carbsG": number, "fatG": number}

Use realistic values based on Indonesian food composition data.
If unsure, provide reasonable estimates for typical Indonesian portions.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean and parse JSON
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const nutrition = JSON.parse(cleanText);

    logger.info('Nutrition estimated for food', { foodName, portion, nutrition });

    return {
      calories: Number(nutrition.calories) || 0,
      proteinG: Number(nutrition.proteinG) || 0,
      carbsG: Number(nutrition.carbsG) || 0,
      fatG: Number(nutrition.fatG) || 0,
    };
  } catch (error) {
    logger.error('Error estimating nutrition:', error);
    // Return default estimates based on common Indonesian food
    return {
      calories: 250,
      proteinG: 10,
      carbsG: 35,
      fatG: 8,
    };
  }
}

/**
 * Get food database context for LLM prompt
 * Fetches relevant foods from database based on user requirements
 */
async function getFoodDatabaseContext(request: MealPlanGenerationRequest): Promise<string> {
  try {
    // Build where clause based on user's dietary restrictions
    const whereClause: any = {};
    
    if (request.dietaryRestrictions?.includes('vegetarian')) {
      whereClause.isVegetarian = true;
    }
    if (request.dietaryRestrictions?.includes('vegan')) {
      whereClause.isVegan = true;
    }
    if (request.dietaryRestrictions?.includes('halal')) {
      whereClause.isHalal = true;
    }
    
    // Apply medical condition filters
    if (request.medicalConditions?.includes('Hipertensi')) {
      whereClause.sodiumMg = { lt: 600 };
    }
    if (request.medicalConditions?.includes('Diabetes')) {
      whereClause.sugarG = { lt: 15 };
    }
    
    // Get foods from each category
    const categories = ['proteins', 'grains', 'vegetables', 'fruits'];
    const foodsByCategory: Record<string, any[]> = {};
    
    for (const category of categories) {
      const foods = await prisma.localFood.findMany({
        where: {
          ...whereClause,
          category,
        },
        take: 15,
        orderBy: { name: 'asc' },
        select: {
          name: true,
          calories: true,
          proteinG: true,
          carbsG: true,
          fatG: true,
          sodiumMg: true,
          sugarG: true,
          benefits: true,
        },
      });
      
      foodsByCategory[category] = foods;
    }
    
    // Get prepared dishes
    const preparedDishes = await prisma.localFood.findMany({
      where: {
        ...whereClause,
        category: 'prepared_dishes',
      },
      take: 20,
      orderBy: { name: 'asc' },
      select: {
        name: true,
        calories: true,
        proteinG: true,
        carbsG: true,
        fatG: true,
        sodiumMg: true,
        sugarG: true,
      },
    });
    
    foodsByCategory['prepared_dishes'] = preparedDishes;
    
    // Build context string
    let context = `\n=== DATABASE MAKANAN INDONESIA ===\n`;
    context += `Database ini berisi data nutrisi akurat untuk 1346 makanan Indonesia.\n`;
    context += `GUNAKAN data nutrisi dari database ini untuk rekomendasi yang akurat.\n\n`;
    
    for (const [category, foods] of Object.entries(foodsByCategory)) {
      if (foods.length > 0) {
        const categoryName = getCategoryName(category);
        context += `\n${categoryName}:\n`;
        context += foods.map(f => 
          `- ${f.name}: ${f.calories}kcal, P:${f.proteinG}g, K:${f.carbsG}g, L:${f.fatG}g` +
          (f.sodiumMg ? `, Na:${f.sodiumMg}mg` : '') +
          (f.sugarG ? `, Gula:${f.sugarG}g` : '')
        ).join('\n');
        context += '\n';
      }
    }
    
    return context;
  } catch (error) {
    logger.error('Error getting food database context:', error);
    return '\n=== Catatan: Tidak dapat mengakses database makanan lokal ===\n';
  }
}

/**
 * Get Indonesian category name
 */
function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    'proteins': '🥩 PROTEIN (per 100g)',
    'grains': '🍚 KARBOHIDRAT (per 100g)',
    'vegetables': '🥬 SAYURAN (per 100g)',
    'fruits': '🍌 BUAH-BUAHAN (per 100g)',
    'prepared_dishes': '🍛 MASAKAN SIAP SAJI (per porsi)',
    'spices': '🌶️ BUMBU & REMPAH',
    'dairy': '🥛 SUSU & OLAHAN',
    'snacks': '🍘 CEMILAN',
    'beverages': '🥤 MINUMAN',
  };
  
  return names[category] || category.toUpperCase();
}

/**
 * Find food in database by name and return nutrition data
 */
export async function findFoodInDatabase(foodName: string): Promise<any | null> {
  try {
    const searchName = foodName.toLowerCase().trim();
    
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
    
    return food;
  } catch (error) {
    logger.error('Error finding food in database:', error);
    return null;
  }
}

