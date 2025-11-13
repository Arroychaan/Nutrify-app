import { Router } from 'express';
import { registerController, loginController, refreshTokenController, logoutController, getMeController } from '@controllers/authController.js';
import { authenticateToken } from '@middlewares/auth.js';

const router = Router();

// Public routes
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshTokenController);

// Protected routes
router.post('/logout', authenticateToken, logoutController);
router.get('/me', authenticateToken, getMeController);

export default router;
