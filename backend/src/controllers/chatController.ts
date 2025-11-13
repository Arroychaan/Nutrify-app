import { Request, Response } from 'express';
import { asyncHandler } from '@middlewares/errorHandler.js';
import logger from '@config/logger.js';

/**
 * Send chat message
 * POST /api/v1/chat/messages
 */
export const sendChatMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId, message } = req.body;
    const userId = req.userId!;

    logger.info('Processing chat message', { userId, conversationId });

    // TODO: Validate message
    // TODO: Fetch conversation or create new one
    // TODO: Call LLM service
    // TODO: Save message to database
    // TODO: Return response

    res.json({
      success: true,
      data: {
        conversationId: 'temp-id',
        message: 'Processing your request...',
        messageId: 'temp-msg-id',
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
    const { page = 1, pageSize = 10 } = req.query;

    logger.info('Fetching conversations', { userId });

    // TODO: Fetch conversations from database
    // TODO: Apply pagination

    res.json({
      success: true,
      data: {
        conversations: [],
        total: 0,
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

    // TODO: Fetch conversation from database
    // TODO: Validate ownership

    res.json({
      success: true,
      data: {
        id: conversationId,
        messages: [],
      },
    });
  }
);
