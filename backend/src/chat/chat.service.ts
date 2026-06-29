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
  conversations,
  chatMessages,
  foodLogs,
  biomarkerRecords,
  mealPlans,
} from '../db/schema.js';
import { eq, and, desc, asc, count, sql } from 'drizzle-orm';
import { LlmService } from '../llm/llm.service.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
    private llmService: LlmService,
    private configService: ConfigService,
  ) {}

  async sendChatMessage(userId: string, body: any) {
    const { conversationId, message } = body;

    this.logger.log(`Processing chat message from user: ${userId}`);

    if (
      !message ||
      typeof message !== 'string' ||
      message.trim().length === 0
    ) {
      throw new BadRequestException('Message is required');
    }

    let conversation: any = null;
    if (conversationId) {
      const [existingConv] = await this.db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, conversationId),
            eq(conversations.userId, userId),
          ),
        )
        .limit(1);

      if (!existingConv) {
        throw new NotFoundException('Conversation not found');
      }
      conversation = existingConv;
    }

    const [latestMealPlan] = await this.db
      .select({ id: mealPlans.id })
      .from(mealPlans)
      .where(eq(mealPlans.userId, userId))
      .orderBy(desc(mealPlans.createdAt))
      .limit(1);

    if (!conversation) {
      const [newConv] = await this.db
        .insert(conversations)
        .values({
          userId,
          currentMealPlanId: latestMealPlan?.id || null,
          topic: message.substring(0, 50) || 'Percakapan Baru',
        })
        .returning();
      conversation = newConv;
    }

    // Save user message
    await this.db.insert(chatMessages).values({
      conversationId: conversation.id,
      role: 'user',
      content: message.trim(),
    });

    // Get last 10 messages for context
    const recentMsgs = await this.db
      .select({
        role: chatMessages.role,
        content: chatMessages.content,
      })
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversation.id))
      .orderBy(asc(chatMessages.createdAt))
      .limit(10);

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayFoodLogs: any[] = await this.db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          sql`${foodLogs.loggedAt} >= ${startOfDay}`,
          sql`${foodLogs.loggedAt} <= ${endOfDay}`,
        ),
      )
      .catch(() => [] as any[]);

    const todayNutrition = todayFoodLogs.reduce(
      (acc: any, log: any) => ({
        calories: acc.calories + (Number(log.calories) || 0),
        protein: acc.protein + (Number(log.proteinG) || 0),
        carbs: acc.carbs + (Number(log.carbsG) || 0),
        fat: acc.fat + (Number(log.fatG) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const [latestBiomarker] = await this.db
      .select()
      .from(biomarkerRecords)
      .where(eq(biomarkerRecords.userId, userId))
      .orderBy(desc(biomarkerRecords.recordedAt))
      .limit(1)
      .catch(() => []);

    let bmi = latestBiomarker?.bmi ? Number(latestBiomarker.bmi) : 0;
    if (!bmi && user?.heightCm && user?.currentWeightKg) {
      const heightM = Number(user.heightCm) / 100;
      bmi = Number(user.currentWeightKg) / (heightM * heightM);
    }

    let calorieTarget = 2000;
    if (user) {
      const weight = Number(user.currentWeightKg);
      const height = Number(user.heightCm);
      const age = user.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(user.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
          )
        : 30;
      let bmr = 10 * weight + 6.25 * height - 5 * age;
      bmr = user.gender === 'female' ? bmr - 161 : bmr + 5;
      const multipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };
      let tdee = Math.round(
        bmr * (multipliers[user.activityLevel || 'moderate'] || 1.55),
      );

      if (bmi >= 30) {
        tdee = Math.max(1200, tdee - 750);
      } else if (bmi >= 25) {
        tdee = Math.max(1200, tdee - 500);
      } else if (bmi < 18.5) {
        tdee = tdee + 400;
      }
      calorieTarget = tdee;
    }

    const systemContext = {
      userName: user?.fullName ?? 'Pengguna',
      userEmail: user?.email,
      gender: user?.gender,
      age: user?.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(user.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
          )
        : null,
      heightCm: user?.heightCm ? Number(user.heightCm) : null,
      currentWeightKg: user?.currentWeightKg
        ? Number(user.currentWeightKg)
        : null,
      targetWeightKg: user?.targetWeightKg ? Number(user.targetWeightKg) : null,
      bmi: Math.round(bmi * 10) / 10,
      activityLevel: user?.activityLevel,
      culture: user?.culture || undefined,
      religion: user?.religion,
      medicalConditions: user?.medicalConditions ?? [],
      medications: user?.medications ?? [],
      allergies: user?.allergies ?? [],
      dietaryRestrictions: user?.dietaryRestrictions ?? [],
      dislikes: user?.dislikes ?? [],
      calorieTarget,
      todayCaloriesConsumed: Math.round(Number(todayNutrition.calories)),
      todayCaloriesRemaining: Math.max(
        0,
        calorieTarget - Math.round(Number(todayNutrition.calories)),
      ),
      todayMealsLogged: todayFoodLogs.length,
      todayFoodLog: todayFoodLogs.map(
        (f: any) => `${f.mealType}: ${f.foodName} (${f.portion || '1 porsi'})`,
      ),
      latestBiomarker: latestBiomarker
        ? {
            bloodGlucose: latestBiomarker.bloodGlucose,
            bloodPressure: latestBiomarker.systolicBp
              ? `${latestBiomarker.systolicBp}/${latestBiomarker.diastolicBp}`
              : null,
            cholesterol: latestBiomarker.totalCholesterol,
            recordedAt: latestBiomarker.recordedAt,
          }
        : null,
      streakDays: user?.streakDays ?? 0,
      currentMealPlanId: latestMealPlan?.id,
    };

    const llmResp = await this.llmService.chatWithRotation(
      recentMsgs.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      this.buildSystemPrompt(systemContext),
    );

    const [assistantMsg] = await this.db
      .insert(chatMessages)
      .values({
        conversationId: conversation.id,
        role: 'assistant',
        content: llmResp,
        llmModel:
          this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash',
      })
      .returning();

    await this.db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversation.id));

    return {
      conversationId: conversation.id,
      messageId: assistantMsg.id,
      message: assistantMsg.content,
    };
  }

  private buildSystemPrompt(context: any): string {
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
      prompt += `\n\n=== PROFIL PENGGUNA ===`;
      prompt += `\nNama: ${context.userName}`;
      if (context.gender)
        prompt += `\nJenis Kelamin: ${context.gender === 'male' ? 'Laki-laki' : 'Perempuan'}`;
      if (context.age) prompt += `\nUsia: ${context.age} tahun`;

      prompt += `\n\n=== METRIK FISIK ===`;
      if (context.heightCm) prompt += `\nTinggi: ${context.heightCm} cm`;
      if (context.currentWeightKg)
        prompt += `\nBerat saat ini: ${context.currentWeightKg} kg`;
      if (context.targetWeightKg)
        prompt += `\nTarget berat: ${context.targetWeightKg} kg`;
      if (context.bmi) prompt += `\nBMI: ${context.bmi}`;
      if (context.activityLevel)
        prompt += `\nLevel aktivitas: ${context.activityLevel}`;

      if (
        context.medicalConditions?.length > 0 ||
        context.allergies?.length > 0 ||
        context.medications?.length > 0
      ) {
        prompt += `\n\n=== KONDISI KESEHATAN ===`;
        if (context.medicalConditions?.length > 0)
          prompt += `\nKondisi medis: ${context.medicalConditions.join(', ')}`;
        if (context.medications?.length > 0)
          prompt += `\nObat yang dikonsumsi: ${context.medications.join(', ')}`;
        if (context.allergies?.length > 0)
          prompt += `\nAlergi: ${context.allergies.join(', ')}`;
      }

      prompt += `\n\n=== PROGRESS HARI INI (REAL-TIME) ===`;
      prompt += `\nTarget kalori harian: ${context.calorieTarget} kcal`;
      prompt += `\nKalori sudah dikonsumsi: ${context.todayCaloriesConsumed} kcal`;
      prompt += `\nSisa kalori: ${context.todayCaloriesRemaining} kcal`;

      if (context.todayFoodLog?.length > 0) {
        prompt += `\nDetail Makanan Hari Ini:`;
        context.todayFoodLog.forEach((log: string) => {
          prompt += `\n- ${log}`;
        });
      } else {
        prompt += `\nBelum ada makanan yang dicatat hari ini.`;
      }
    }

    return prompt;
  }

  async getConversations(userId: string, query: any) {
    const page = Number(query.page ?? 1);
    const pageSize = Math.min(50, Number(query.pageSize ?? 10));

    // Get active conversations count
    const [countResult] = await this.db
      .select({ total: count() })
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          eq(conversations.isArchived, false),
        ),
      );

    const totalCount = countResult?.total || 0;

    const items = await this.db.query.conversations.findMany({
      where: and(
        eq(conversations.userId, userId),
        eq(conversations.isArchived, false),
      ),
      orderBy: [desc(conversations.updatedAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      with: {
        messages: {
          orderBy: [desc(chatMessages.createdAt)],
          limit: 1,
        },
      },
    });

    return {
      conversations: items.map((c) => ({
        id: c.id,
        updatedAt: c.updatedAt,
        lastMessage: c.messages[0]?.content || null,
        topic: c.topic,
      })),
      total: totalCount,
      page,
      pageSize,
    };
  }

  async getConversation(userId: string, conversationId: string) {
    const conv = await this.db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId),
      ),
      with: {
        messages: {
          orderBy: [asc(chatMessages.createdAt)],
        },
      },
    });

    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    return {
      id: conv.id,
      messages: conv.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    };
  }

  async deleteConversation(userId: string, conversationId: string) {
    const [conv] = await this.db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId),
        ),
      )
      .limit(1);

    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    await this.db
      .update(conversations)
      .set({ isArchived: true })
      .where(eq(conversations.id, conversationId));

    return { message: 'Conversation deleted successfully' };
  }
}
