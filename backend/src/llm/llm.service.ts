import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly rateLimitCooldownMs = 60000;
  private readonly rateLimitedKeys = new Map<string, number>();
  private geminiKeyIndex = 0;

  constructor(private configService: ConfigService) {}

  private getGeminiKeys(): string[] {
    const keysStr =
      this.configService.get<string>('GEMINI_API_KEYS') ||
      this.configService.get<string>('GEMINI_API_KEY') ||
      '';
    return keysStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }

  private isRateLimitError(err: any): boolean {
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

  private getNextGeminiKey(): string | null {
    const keys = this.getGeminiKeys();
    if (keys.length === 0) return null;

    const now = Date.now();

    for (let attempt = 0; attempt < keys.length; attempt++) {
      const idx = (this.geminiKeyIndex + attempt) % keys.length;
      const key = keys[idx];
      const limitedUntil = this.rateLimitedKeys.get(key);

      if (!limitedUntil || now >= limitedUntil) {
        this.geminiKeyIndex = (idx + 1) % keys.length;
        return key;
      }
    }

    return keys[0];
  }

  private markKeyRateLimited(apiKey: string): void {
    this.rateLimitedKeys.set(apiKey, Date.now() + this.rateLimitCooldownMs);
    this.logger.warn(
      `Gemini API Key rate-limited. Cooldown of ${this.rateLimitCooldownMs}ms started for key: ${apiKey.slice(0, 8)}...`,
    );
  }

  async generateWithRotation(
    prompt: string,
    systemPrompt: string,
  ): Promise<string> {
    const keys = this.getGeminiKeys();
    if (keys.length === 0) {
      throw new InternalServerErrorException(
        'Gemini AI is not configured (missing API Key)',
      );
    }

    const attempts = Math.max(1, keys.length);
    let lastError: unknown = null;

    const modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';

    for (let i = 0; i < attempts; i++) {
      const apiKey = this.getNextGeminiKey();
      if (!apiKey) break;

      try {
        const client = new GoogleGenerativeAI(apiKey);
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err: any) {
        lastError = err;
        if (this.isRateLimitError(err)) {
          this.markKeyRateLimited(apiKey);
          continue;
        }
        throw err;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new InternalServerErrorException(
          'Gemini rate limit reached for all keys',
        );
  }

  async chatWithRotation(
    messages: ChatMessage[],
    systemPrompt: string,
  ): Promise<string> {
    const keys = this.getGeminiKeys();
    if (keys.length === 0) {
      throw new InternalServerErrorException(
        'Gemini AI is not configured (missing API Key)',
      );
    }

    const attempts = Math.max(1, keys.length);
    let lastError: unknown = null;

    const modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';

    for (let i = 0; i < attempts; i++) {
      const apiKey = this.getNextGeminiKey();
      if (!apiKey) break;

      try {
        const client = new GoogleGenerativeAI(apiKey);
        const model = client.getGenerativeModel({
          model: modelName,
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
        if (this.isRateLimitError(err)) {
          this.markKeyRateLimited(apiKey);
          continue;
        }
        throw err;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new InternalServerErrorException(
          'Gemini rate limit reached for all keys',
        );
  }

  async generateNutritionEstimate(
    foodName: string,
    portion: string,
  ): Promise<{
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  }> {
    try {
      const prompt = `Estimate the nutrition for this Indonesian food:
Food: ${foodName}
Portion: ${portion}

IMPORTANT: Use values aligned with Indonesian food composition data (DKBM - Daftar Komposisi Bahan Makanan Indonesia).
For reference, typical Indonesian foods per 100g:
- Nasi putih: ~130 kcal, 2.7g protein, 28g carbs, 0.3g fat
- Ayam goreng: ~287 kcal, 32g protein, 1g carbs, 16g fat  
- Tempe goreng: ~212 kcal, 17g protein, 13g carbs, 11g fat
- Tahu: ~76 kcal, 8g protein, 2g carbs, 4.8g fat
- Nasi goreng: ~180 kcal, 4g protein, 25g carbs, 7g fat

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{"calories": number, "proteinG": number, "carbsG": number, "fatG": number}`;

      const systemPrompt = `You are a certified Indonesian nutrition expert with deep knowledge of DKBM (Daftar Komposisi Bahan Makanan Indonesia). 
Your estimates must be accurate and consistent with official Indonesian food composition databases.
Always respond with valid JSON only, no explanations.`;

      const text = await this.generateWithRotation(prompt, systemPrompt);

      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const nutrition = JSON.parse(cleanText);

      return {
        calories: Number(nutrition.calories) || 0,
        proteinG: Number(nutrition.proteinG) || 0,
        carbsG: Number(nutrition.carbsG) || 0,
        fatG: Number(nutrition.fatG) || 0,
      };
    } catch (error) {
      this.logger.error('Error estimating nutrition:', error);
      return {
        calories: 250,
        proteinG: 10,
        carbsG: 35,
        fatG: 8,
      };
    }
  }
}
