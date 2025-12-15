import { Request, Response } from 'express';
import { asyncHandler } from '@middlewares/errorHandler.js';
import logger from '@config/logger.js';
import prisma from '@config/prisma.js';
import { chatWithGemini } from '@services/llmService.js';

/**
 * Send chat message
 * POST /api/v1/chat/messages
 */
export const sendChatMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId, message } = req.body as { conversationId?: string; message?: string };
    const userId = req.userId!;

    logger.info('Processing chat message', { userId, conversationId });

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Message is required' },
      });
      return;
    }

    // Ensure conversation exists or create a new one with current context
    let conversation = null as Awaited<ReturnType<typeof prisma.conversation.findFirst>> | null;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (!conversation) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } });
        return;
      }
    }

    // Fetch latest meal plan for context
    const latestMealPlan = await prisma.mealPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          currentMealPlanId: latestMealPlan?.id ?? null,
          topic: 'nutrition_education',
        },
      });
    }

    // Persist user message first
    const userMsg = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message.trim(),
      },
    });

    // Build short history (last 10 messages) for context to the LLM
    const recentMessages = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
      select: { role: true, content: true },
    });

    // Fetch FULL user profile for AI context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,
        email: true,
        dateOfBirth: true,
        gender: true,
        heightCm: true,
        currentWeightKg: true,
        targetWeightKg: true,
        activityLevel: true,
        culture: true,
        religion: true,
        medicalConditions: true,
        medications: true,
        allergies: true,
        dietaryRestrictions: true,
        dislikes: true,
        streakDays: true,
      },
    });

    // Fetch today's food logs for context
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayLogs = await prisma.foodLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        mealType: true,
        foodName: true,
        calories: true,
        proteinG: true,
        carbsG: true,
        fatG: true,
      },
    });

    // Calculate daily summary
    const dailySummary = todayLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + (Number(log.calories) || 0),
        protein: acc.protein + (Number(log.proteinG) || 0),
        carbs: acc.carbs + (Number(log.carbsG) || 0),
        fat: acc.fat + (Number(log.fatG) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const todayFoodLogs = await (prisma as any).foodLog.findMany({
      where: {
        userId,
        loggedAt: { gte: startOfDay, lte: endOfDay },
      },
      select: {
        mealType: true,
        foodName: true,
        portion: true,
        calories: true,
        proteinG: true,
        carbsG: true,
        fatG: true,
      },
    }).catch(() => []);

    // Calculate today's nutrition totals
    const todayNutrition = todayFoodLogs.reduce(
      (acc: any, log: any) => ({
        calories: acc.calories + (Number(log.calories) || 0),
        protein: acc.protein + (Number(log.proteinG) || 0),
        carbs: acc.carbs + (Number(log.carbsG) || 0),
        fat: acc.fat + (Number(log.fatG) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Fetch latest biomarker records
    const latestBiomarker = await prisma.biomarkerRecord.findFirst({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      select: {
        weightKg: true,
        bmi: true,
        bloodGlucose: true,
        systolicBp: true,
        diastolicBp: true,
        totalCholesterol: true,
        recordedAt: true,
      },
    }).catch(() => null);

    // Calculate BMI if not in biomarker
    let bmi = latestBiomarker?.bmi ? Number(latestBiomarker.bmi) : 0;
    if (!bmi && user?.heightCm && user?.currentWeightKg) {
      const heightM = Number(user.heightCm) / 100;
      bmi = Number(user.currentWeightKg) / (heightM * heightM);
    }

    // Calculate calorie target WITH BMI-based adjustment
    let calorieTarget = 2000;
    if (user) {
      const weight = Number(user.currentWeightKg);
      const height = Number(user.heightCm);
      const age = user.dateOfBirth
        ? Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 30;
      let bmr = 10 * weight + 6.25 * height - 5 * age;
      bmr = user.gender === 'female' ? bmr - 161 : bmr + 5;
      const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
      let tdee = Math.round(bmr * (multipliers[user.activityLevel || 'moderate'] || 1.55));

      // Apply BMI-based calorie adjustment for weight goals
      if (bmi >= 30) {
        // OBESITAS: deficit 750 kcal
        tdee = Math.max(1200, tdee - 750);
      } else if (bmi >= 25) {
        // GEMUK: deficit 500 kcal
        tdee = Math.max(1200, tdee - 500);
      } else if (bmi < 18.5) {
        // KURUS: surplus 400 kcal
        tdee = tdee + 400;
      }

      calorieTarget = tdee;
    }

    // Build comprehensive system context
    const systemContext = {
      // User Profile
      userName: user?.fullName ?? 'Pengguna',
      userEmail: user?.email,
      gender: user?.gender,
      age: user?.dateOfBirth
        ? Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null,

      // Physical Metrics
      heightCm: user?.heightCm ? Number(user.heightCm) : null,
      currentWeightKg: user?.currentWeightKg ? Number(user.currentWeightKg) : null,
      targetWeightKg: user?.targetWeightKg ? Number(user.targetWeightKg) : null,
      bmi: Math.round(bmi * 10) / 10,
      activityLevel: user?.activityLevel,

      // Preferences
      culture: user?.culture ?? undefined,
      religion: user?.religion,
      medicalConditions: user?.medicalConditions ?? [],
      medications: user?.medications ?? [],
      allergies: user?.allergies ?? [],
      dietaryRestrictions: user?.dietaryRestrictions ?? [],
      dislikes: user?.dislikes ?? [],

      // Today's Progress
      calorieTarget,
      todayCaloriesConsumed: Math.round(todayNutrition.calories),
      todayCaloriesRemaining: Math.max(0, calorieTarget - Math.round(todayNutrition.calories)),
      todayMealsLogged: todayFoodLogs.length,
      todayFoodLog: todayFoodLogs.map((f: any) => `${f.mealType}: ${f.foodName} (${f.portion})`),

      // Latest Biomarkers
      latestBiomarker: latestBiomarker ? {
        bloodGlucose: latestBiomarker.bloodGlucose,
        bloodPressure: latestBiomarker.systolicBp ? `${latestBiomarker.systolicBp}/${latestBiomarker.diastolicBp}` : null,
        cholesterol: latestBiomarker.totalCholesterol,
        recordedAt: latestBiomarker.recordedAt,
      } : null,

      // Engagement
      streakDays: user?.streakDays ?? 0,
      currentMealPlanId: latestMealPlan?.id,
      latestMealPlan,
      todayLogs,
      dailySummary,
    } as Record<string, any>;

    // Call LLM
    const llmResp = await chatWithGemini(
      recentMessages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      systemContext
    );

    // Persist assistant message
    const assistantMsg = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: llmResp.message,
        llmModel: llmResp.model,
      },
    });

    // Touch conversation updatedAt
    await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        messageId: assistantMsg.id,
        message: assistantMsg.content,
      },
    });
  }
);

/**
 * Get conversations
 * GET /api/v1/chat/conversations
 */
export const getConversationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const page = Number(req.query.page ?? 1);
    const pageSize = Math.min(50, Number(req.query.pageSize ?? 10));

    logger.info('Fetching conversations', { userId, page, pageSize });

    const [total, items] = await Promise.all([
      prisma.conversation.count({ where: { userId, isArchived: false } }),
      prisma.conversation.findMany({
        where: { userId, isArchived: false },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        conversations: items.map((c) => ({
          id: c.id,
          updatedAt: c.updatedAt,
          lastMessage: c.messages[0]?.content ?? null,
          topic: c.topic,
        })),
        total,
        page,
        pageSize,
      },
    });
  }
);

/**
 * Get conversation details
 * GET /api/v1/chat/conversations/:conversationId
 */
export const getConversationController = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.userId!;

    logger.info('Fetching conversation details', { userId, conversationId });

    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conv) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } });
      return;
    }

    res.json({
      success: true,
      data: {
        id: conv.id,
        messages: conv.messages.map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })),
      },
    });
  }
);

/**
 * Delete conversation
 * DELETE /api/v1/chat/conversations/:conversationId
 */
export const deleteConversationController = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.userId!;

    logger.info('Deleting conversation', { userId, conversationId });

    // Verify ownership
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conv) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } });
      return;
    }

    // Soft delete / Archive
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { isArchived: true },
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  }
);
