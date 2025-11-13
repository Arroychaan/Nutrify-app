import { Router } from 'express';
import { sendChatMessageController, getConversationsController, getConversationController } from '@controllers/chatController.js';
import { authenticateToken } from '@middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/messages', sendChatMessageController);
router.get('/conversations', getConversationsController);
router.get('/conversations/:conversationId', getConversationController);

export default router;
