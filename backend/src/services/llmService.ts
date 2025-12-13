import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '@config/index.js';
import logger from '@config/logger.js';
import prisma from '@config/prisma.js';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const RATE_LIMIT_COOLDOWN_MS = 60_000;
const rateLimitedGeminiKeys = new Map<string, number>();
let geminiKeyIndex = 0;

function isRateLimitError(err: any): boolean {
  const status = err?.status || err?.response?.status;
  const message = String(err?.message || '').toLowerCase();
  return (
    status === 429 ||
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('resource has been exhausted')
  );
}

function getNextGeminiKey(): string | null {
  const keys = config.llm.gemini.apiKeys;
  if (!keys || keys.length === 0) return null;

  const now = Date.now();

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const idx = (geminiKeyIndex + attempt) % keys.length;
    const key = keys[idx];
    const limitedUntil = rateLimitedGeminiKeys.get(key);

    if (!limitedUntil || now >= limitedUntil) {
      geminiKeyIndex = (idx + 1) % keys.length;
      return key;
    }
  }

  // All keys in cooldown; still return one so we can surface a real error
  return keys[0];
}

function markGeminiKeyRateLimited(apiKey: string): void {
  rateLimitedGeminiKeys.set(apiKey, Date.now() + RATE_LIMIT_COOLDOWN_MS);
  logger.warn('Gemini key rate-limited; cooldown started', {
    keyPrefix: `${apiKey.slice(0, 8)}...`,
    cooldownMs: RATE_LIMIT_COOLDOWN_MS,
  });
}

async function geminiChatWithRotation(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const keys = config.llm.gemini.apiKeys;
  if (!keys || keys.length === 0) {
    throw new Error('Gemini not configured');
  }

  const attempts = Math.max(1, keys.length);
  let lastError: unknown = null;

  for (let i = 0; i < attempts; i++) {
    const apiKey = getNextGeminiKey();
    if (!apiKey) break;

    try {
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({
        model: config.llm.gemini.model,
        systemInstruction: systemPrompt,
      });

      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const lastMessage = messages[messages.length - 1]?.content || '';
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastMessage);
      return result.response.text();
    } catch (err: any) {
      lastError = err;
      if (isRateLimitError(err)) {
        markGeminiKeyRateLimited(apiKey);
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Gemini rate limit reached for all keys');
}

async function geminiGenerateWithRotation(prompt: string, systemPrompt: string): Promise<string> {
  const keys = config.llm.gemini.apiKeys;
  if (!keys || keys.length === 0) {
    throw new Error('Gemini not configured');
  }

  const attempts = Math.max(1, keys.length);
  let lastError: unknown = null;

  for (let i = 0; i < attempts; i++) {
    const apiKey = getNextGeminiKey();
    if (!apiKey) break;

    try {
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({
        model: config.llm.gemini.model,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      lastError = err;
      if (isRateLimitError(err)) {
        markGeminiKeyRateLimited(apiKey);
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Gemini rate limit reached for all keys');
}

// ============================================
// Public API
// ============================================

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

export async function generateMealPlan(request: MealPlanGenerationRequest): Promise<any> {
  const prompt = buildMealPlanPrompt(request);
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
}`;

  const text = await geminiGenerateWithRotation(prompt, systemPrompt);

  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const mealPlanData = JSON.parse(cleanText);

  return {
    mealPlan: mealPlanData,
    model: config.llm.gemini.model,
  };
}

export async function chatWithGemini(
  messages: ChatMessage[],
  systemContext?: Record<string, any>
): Promise<{ message: string; model: string }> {
  const systemPrompt = buildSystemPrompt(systemContext);
  const text = await geminiChatWithRotation(messages, systemPrompt);

  return {
    message: text,
    model: config.llm.gemini.model,
  };
}

export async function generateNutritionEstimate(
  foodName: string,
  portion: string
): Promise<{ calories: number; proteinG: number; carbsG: number; fatG: number }> {
  try {
    const prompt = `Estimate the nutrition for this Indonesian food:\nFood: ${foodName}\nPortion: ${portion}\n\nReturn ONLY a JSON object with this exact structure (no markdown, no extra text):\n{"calories": number, "proteinG": number, "carbsG": number, "fatG": number}\n\nUse realistic values based on Indonesian food composition data.\nIf unsure, provide reasonable estimates for typical Indonesian portions.`;

    const text = await geminiGenerateWithRotation(prompt, 'You are a nutrition expert. Respond with JSON only.');

    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const nutrition = JSON.parse(cleanText);

    return {
      calories: Number(nutrition.calories) || 0,
      proteinG: Number(nutrition.proteinG) || 0,
      carbsG: Number(nutrition.carbsG) || 0,
      fatG: Number(nutrition.fatG) || 0,
    };
  } catch (error) {
    logger.error('Error estimating nutrition:', error);
    return {
      calories: 250,
      proteinG: 10,
      carbsG: 35,
      fatG: 8,
    };
  }
}

// ============================================
// Prompts & Context Helpers
// ============================================

function buildMealPlanPrompt(request: MealPlanGenerationRequest): string {
  return `Generate a meal plan for:\n- Culture: ${request.culture}\n- Medical conditions: ${request.medicalConditions.join(', ') || 'None'}\n- Allergies: ${request.allergies.join(', ') || 'None'}\n- Dietary restrictions: ${request.dietaryRestrictions.join(', ') || 'None'}\n- Daily calorie target: ${request.calorieTarget} kcal\n- Duration: ${request.duration}\n- Budget: ${request.budget ? `Rp ${request.budget}/day` : 'No limit'}\n\nRequirements:\n1. Use 60%+ local Indonesian foods\n2. Comply with AKG guidelines\n3. Respect medical conditions and allergies\n4. Stay within budget if provided\n5. Include cultural significance\n\nGenerate meal plan with detailed nutrition information per meal.`;
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

    if (context.heightCm || context.currentWeightKg) {
      prompt += `\n\n=== METRIK FISIK ===`;
      if (context.heightCm) prompt += `\nTinggi: ${context.heightCm} cm`;
      if (context.currentWeightKg) prompt += `\nBerat saat ini: ${context.currentWeightKg} kg`;
      if (context.targetWeightKg) prompt += `\nTarget berat: ${context.targetWeightKg} kg`;
      if (context.bmi) prompt += `\nBMI: ${context.bmi}`;
      if (context.activityLevel) prompt += `\nLevel aktivitas: ${context.activityLevel}`;
    }

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

    if (context.streakDays > 0) {
      prompt += `\n\nStreak pengguna: ${context.streakDays} hari berturut-turut 🔥`;
    }
  }

  return prompt;
}

async function getFoodDatabaseContext(request: MealPlanGenerationRequest): Promise<string> {
  try {
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

    if (request.medicalConditions?.includes('Hipertensi')) {
      whereClause.sodiumMg = { lt: 600 };
    }
    if (request.medicalConditions?.includes('Diabetes')) {
      whereClause.sugarG = { lt: 15 };
    }

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

    let context = `\n=== DATABASE MAKANAN INDONESIA ===\n`;
    context += `Database ini berisi data nutrisi akurat untuk 1346 makanan Indonesia.\n`;
    context += `GUNAKAN data nutrisi dari database ini untuk rekomendasi yang akurat.\n\n`;

    for (const [category, foods] of Object.entries(foodsByCategory)) {
      if (foods.length > 0) {
        const categoryName = getCategoryName(category);
        context += `\n${categoryName}:\n`;
        context += foods
          .map(
            (f) =>
              `- ${f.name}: ${f.calories}kcal, P:${f.proteinG}g, K:${f.carbsG}g, L:${f.fatG}g` +
              (f.sodiumMg ? `, Na:${f.sodiumMg}mg` : '') +
              (f.sugarG ? `, Gula:${f.sugarG}g` : '')
          )
          .join('\n');
        context += '\n';
      }
    }

    return context;
  } catch (error) {
    logger.error('Error getting food database context:', error);
    return '\n=== Catatan: Tidak dapat mengakses database makanan lokal ===\n';
  }
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    proteins: '🥩 PROTEIN (per 100g)',
    grains: '🍚 KARBOHIDRAT (per 100g)',
    vegetables: '🥬 SAYURAN (per 100g)',
    fruits: '🍌 BUAH-BUAHAN (per 100g)',
    prepared_dishes: '🍛 MASAKAN SIAP SAJI (per porsi)',
    spices: '🌶️ BUMBU & REMPAH',
    dairy: '🥛 SUSU & OLAHAN',
    snacks: '🍘 CEMILAN',
    beverages: '🥤 MINUMAN',
  };

  return names[category] || category.toUpperCase();
}

export async function findFoodInDatabase(foodName: string): Promise<any | null> {
  try {
    const searchName = foodName.toLowerCase().trim();

    let food = await prisma.localFood.findFirst({
      where: {
        name: { equals: searchName, mode: 'insensitive' },
      },
    });

    if (!food) {
      food = await prisma.localFood.findFirst({
        where: {
          name: { contains: searchName, mode: 'insensitive' },
        },
      });
    }

    if (!food) {
      const words = searchName.split(' ').filter((w) => w.length > 2);
      if (words.length > 0) {
        food = await prisma.localFood.findFirst({
          where: {
            OR: words.map((word) => ({
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

