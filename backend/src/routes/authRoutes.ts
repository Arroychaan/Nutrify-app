import { Router } from 'express';
import { registerController, loginController, refreshTokenController, logoutController, getMeController, updateProfileController, changePasswordController, deleteAccountController, verifyEmailController, forgotPasswordController, resetPasswordController, generate2FASecretController, verify2FAController, disable2FAController, restoreAccountController } from '@controllers/authController.js';
import { authenticateToken } from '@middlewares/auth.js';

const router = Router();

// Public routes
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshTokenController);
router.get('/verify-email', verifyEmailController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.post('/restore', restoreAccountController);

// Protected routes
router.post('/logout', authenticateToken, logoutController);
router.get('/me', authenticateToken, getMeController);
router.put('/profile', authenticateToken, updateProfileController);
router.put('/password', authenticateToken, changePasswordController);
router.delete('/account', authenticateToken, deleteAccountController);

// 2FA Routes
router.post('/2fa/generate', authenticateToken, generate2FASecretController);
router.post('/2fa/verify', authenticateToken, verify2FAController);
router.post('/2fa/disable', authenticateToken, disable2FAController);

export default router;
