import { Router } from 'express';
import { registerController, loginController, refreshTokenController, logoutController, getMeController, updateProfileController, changePasswordController, deleteAccountController, verifyEmailController } from '@controllers/authController.js';
import { authenticateToken } from '@middlewares/auth.js';

const router = Router();

// Public routes
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshTokenController);
router.get('/verify-email', verifyEmailController);

// Protected routes
router.post('/logout', authenticateToken, logoutController);
router.get('/me', authenticateToken, getMeController);
router.put('/profile', authenticateToken, updateProfileController);
router.put('/password', authenticateToken, changePasswordController);
router.delete('/account', authenticateToken, deleteAccountController);

export default router;
