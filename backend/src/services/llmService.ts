import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '@config/index.js';
import logger from '@config/logger.js';

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
    
    // Using the free-tier friendly model directly.
    const modelName = 'gemini-1.5-flash';
    const model = client.getGenerativeModel({ model: modelName });

    const prompt = buildMealPlanPrompt(request);
    
    const systemPrompt = `You are Nutrify, an expert AI Dietician specializing in Indonesian nutrition and traditional medicine.
      
Your responsibilities:
1. Provide personalized meal plans using LOCAL Indonesian foods
2. Ensure ALL recommendations comply with AKG (Angka Kecukupan Gizi) - Indonesian Dietary Guidelines
3. Never recommend foods that worsen medical conditions
4. Prioritize affordable, accessible foods with cultural significance
5. Respond with valid JSON only (no markdown, no extra text)

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
    
    // Using the free-tier friendly model directly.
    const modelName = 'gemini-1.5-flash';
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

Your expertise includes:
- AKG (Angka Kecukupan Gizi) - Indonesian Dietary Guidelines
- Local Indonesian cuisine from various regions (Jawa, Sunda, Minang, Bugis, Batak, Bali, etc)
- Medical nutrition therapy for chronic conditions
- Cultural and religious dietary practices
- Budget-conscious meal planning

Guidelines:
- Always prioritize user safety (never recommend foods that worsen conditions)
- Use simple Indonesian language
- Provide educational context
- Suggest local alternatives when possible
- Consider cultural preferences
`;

  if (context) {
    if (context.medicalConditions?.length > 0) {
      prompt += `\nUser medical conditions: ${context.medicalConditions.join(', ')}`;
    }
    if (context.culture) {
      prompt += `\nUser culture: ${context.culture}`;
    }
    if (context.allergies?.length > 0) {
      prompt += `\nUser allergies: ${context.allergies.join(', ')}`;
    }
  }

  return prompt;
}
