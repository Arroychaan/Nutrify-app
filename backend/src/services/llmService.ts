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

function getModelCandidates(): string[] {
  const preferred = config.gemini.model || 'gemini-1.5-flash-latest';
  // Robust fallback order
  const fallbacks = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-1.0-pro',
  ];
  return [preferred, ...fallbacks.filter((m) => m !== preferred)];
}

async function getWorkingModel(client: GoogleGenerativeAI): Promise<{ modelName: string }> {
  const candidates = getModelCandidates();
  for (const name of candidates) {
    try {
      // Probe by creating the model handle; SDK defers calls until request.
      // We'll optimistically return the first candidate; downstream will catch and retry if needed.
      return { modelName: name };
    } catch {
      // continue
    }
  }
  throw new Error('No supported Gemini model found');
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
  const { modelName } = await getWorkingModel(client);
  let model = client.getGenerativeModel({ model: modelName });

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
    });

  let result: any;
    try {
      result = await model.generateContent(systemPrompt);
    } catch (e: any) {
      // Retry with next fallback if 404/not supported
      const candidates = getModelCandidates().filter((m) => m !== modelName);
      let success = false;
      for (const alt of candidates) {
        try {
          model = client.getGenerativeModel({ model: alt });
          result = await model.generateContent(systemPrompt);
          success = true;
          break;
        } catch {}
      }
      if (!success) throw e;
    }
  const response = result.response;
    const text = response.text();

    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    const mealPlanData = JSON.parse(cleanText);

    logger.info('Meal plan generated successfully', {
      userId: request.userId,
      model: 'gemini-1.5-flash',
    });

    return {
      mealPlan: mealPlanData,
      model: (model as any)?.model || modelName,
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
  const { modelName } = await getWorkingModel(client);
  let model = client.getGenerativeModel({ model: modelName });

    const systemPrompt = buildSystemPrompt(systemContext);
    
    // Gemini uses a different format - combine system prompt with conversation
    const conversationHistory = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Start chat with history
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // All except last message
    });

    const lastMessage = messages[messages.length - 1];
    const fullPrompt = `${systemPrompt}\n\nUser: ${lastMessage.content}`;

  let result: any;
    try {
      result = await chat.sendMessage(fullPrompt);
    } catch (e: any) {
      // Recreate chat with a fallback model if needed
      const candidates = getModelCandidates().filter((m) => m !== modelName);
      let success = false;
      for (const alt of candidates) {
        try {
          model = client.getGenerativeModel({ model: alt });
          const chatAlt = model.startChat({ history: conversationHistory.slice(0, -1) });
          result = await chatAlt.sendMessage(fullPrompt);
          success = true;
          break;
        } catch {}
      }
      if (!success) throw e;
    }
  const response = result.response;
    const text = response.text();

    return {
      message: text,
      model: (model as any)?.model || modelName,
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
