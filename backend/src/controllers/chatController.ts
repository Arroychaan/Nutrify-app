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
      select: { id: true },
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

    // Enrich system context with user profile and current meal plan id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        culture: true,
        medicalConditions: true,
        allergies: true,
        dietaryRestrictions: true,
      },
    });

    const systemContext = {
      culture: user?.culture ?? undefined,
      medicalConditions: user?.medicalConditions ?? [],
      allergies: user?.allergies ?? [],
      dietaryRestrictions: user?.dietaryRestrictions ?? [],
      currentMealPlanId: latestMealPlan?.id,
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
