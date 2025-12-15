import express from 'express';
import {
    sendChatMessageController,
    getConversationsController,
    getConversationController,
    deleteConversationController,
} from '@controllers/chatController.js';
import { authenticateToken } from '@middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/messages', sendChatMessageController);
router.get('/conversations', getConversationsController);
router.get('/conversations/:conversationId', getConversationController);
router.delete('/conversations/:conversationId', deleteConversationController);

export default router;
