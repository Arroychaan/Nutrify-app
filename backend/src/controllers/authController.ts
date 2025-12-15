import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '@services/emailService.js';
import { Request, Response } from 'express';
import { asyncHandler } from '@middlewares/errorHandler.js';
import { generateAccessToken, generateRefreshToken } from '@utils/jwt.js';
import { hashPassword, comparePasswords } from '@utils/password.js';
import prisma from '@config/prisma.js';
import logger from '@config/logger.js';

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password, fullName, heightCm, currentWeightKg, gender, dateOfBirth, activityLevel } = req.body;

    logger.info('User registration attempt', { email });

    // Validate input
    if (!email || !password || !fullName) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, and full name are required',
        },
      });
      return;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
        },
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        heightCm: heightCm || null,
        currentWeightKg: currentWeightKg || null,
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        activityLevel: activityLevel || 'moderate',
        isVerified: false,
        verificationToken,
        verificationExpires,
        deletedAt: null,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (error) {
      logger.error('Failed to send verification email', { error, userId: user.id });
      // Proceed but log error. User can resend verification later.
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, email);
    const refreshToken = generateRefreshToken(user.id, email);

    logger.info('User registered successfully', { userId: user.id, email });

    res.status(201).json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        accessToken,
        refreshToken,
        expiresIn: 86400, // 24 hours
        message: 'Registration successful. Please check your email to verify your account.',
      },
    });
  }
);

/**
 * Login user
 * POST /api/v1/auth/login
 */
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// ... existing imports ...

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password, totpCode } = req.body;

    logger.info('User login attempt', { email });

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    // Check if account is soft deleted
    if (user.deletedAt) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Account is deactivated. Would you like to restore it?',
        },
      });
      return;
    }

    // Compare password
    const isPasswordValid = await comparePasswords(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    // Check 2FA
    if (user.isTwoFactorEnabled) {
      if (!totpCode) {
        res.status(403).json({
          success: false,
          error: {
            code: '2FA_REQUIRED',
            message: 'Two-factor authentication code is required',
          },
        });
        return;
      }

      const isValid = authenticator.check(totpCode, user.twoFactorSecret!);
      if (!isValid) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid authentication code',
          },
        });
        return;
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, email);
    const refreshToken = generateRefreshToken(user.id, email);

    logger.info('User logged in successfully', { userId: user.id, email });

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        accessToken,
        refreshToken,
        expiresIn: 86400,
      },
    });
  }
);

/**
 * Generate 2FA Secret
 * POST /api/v1/auth/2fa/generate
 */
export const generate2FASecretController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      return;
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'Nutrify', secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // Save secret temporarily (or permanently but disabled)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    res.json({
      success: true,
      data: {
        secret,
        qrCodeUrl,
      },
    });
  }
);

/**
 * Verify and Enable 2FA
 * POST /api/v1/auth/2fa/verify
 */
export const verify2FAController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { token } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      res.status(400).json({ success: false, error: { code: 'SETUP_REQUIRED', message: '2FA setup not initiated' } });
      return;
    }

    const isValid = authenticator.check(token, user.twoFactorSecret);

    if (!isValid) {
      res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid token' } });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
    });
  }
);

/**
 * Disable 2FA
 * POST /api/v1/auth/2fa/disable
 */
export const disable2FAController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      return;
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Invalid password' } });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully',
    });
  }
);

// ... rest of the file ...

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    logger.info('Token refresh attempt');

    // TODO: Verify refresh token
    // TODO: Generate new access token

    const mockUserId = 'user-123';
    const newAccessToken = generateAccessToken(mockUserId, 'user@example.com');

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: 86400,
      },
    });
  }
);

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;

    logger.info('User logout', { userId });

    // TODO: Invalidate tokens (optional with refresh token blacklisting)

    res.json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  }
);

/**
 * Get current user info
 * GET /api/v1/auth/me
 */
export const getMeController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;

    logger.info('Get user info', { userId });

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        heightCm: true,
        currentWeightKg: true,
        targetWeightKg: true,
        gender: true,
        dateOfBirth: true,
        phoneNumber: true,
        activityLevel: true,
        culture: true,
        religion: true,
        medicalConditions: true,
        medications: true,
        allergies: true,
        dietaryRestrictions: true,
        dislikes: true,
        streakDays: true,
        badges: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  }
);

/**
 * Update user profile
 * PUT /api/v1/auth/profile
 */
export const updateProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const {
      fullName,
      dateOfBirth,
      gender,
      phoneNumber,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      activityLevel,
      culture,
      religion,
      medicalConditions,
      medications,
      allergies,
      dietaryRestrictions,
      dislikes,
    } = req.body;

    logger.info('Update user profile', { userId });

    // Validate user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    // Build update data object
    const updateData: any = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) updateData.gender = gender;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (heightCm !== undefined) updateData.heightCm = heightCm || null;
    if (currentWeightKg !== undefined) updateData.currentWeightKg = currentWeightKg || null;
    if (targetWeightKg !== undefined) updateData.targetWeightKg = targetWeightKg || null;
    if (activityLevel !== undefined) updateData.activityLevel = activityLevel;
    if (culture !== undefined) updateData.culture = culture || null;
    if (religion !== undefined) updateData.religion = religion || null;
    if (medicalConditions !== undefined) updateData.medicalConditions = medicalConditions;
    if (medications !== undefined) updateData.medications = medications;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (dietaryRestrictions !== undefined) updateData.dietaryRestrictions = dietaryRestrictions;
    if (dislikes !== undefined) updateData.dislikes = dislikes;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        heightCm: true,
        currentWeightKg: true,
        targetWeightKg: true,
        gender: true,
        dateOfBirth: true,
        phoneNumber: true,
        activityLevel: true,
        culture: true,
        religion: true,
        medicalConditions: true,
        medications: true,
        allergies: true,
        dietaryRestrictions: true,
        dislikes: true,
        streakDays: true,
        badges: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('User profile updated successfully', { userId });

    res.json({
      success: true,
      data: updatedUser,
    });
  }
);

/**
 * Change password
 * PUT /api/v1/auth/password
 */
export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Current password and new password are required' },
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'New password must be at least 8 characters' },
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
      return;
    }

    const isPasswordValid = await comparePasswords(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' },
      });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    logger.info('User password changed successfully', { userId });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }
);

/**
 * Delete account
 * DELETE /api/v1/auth/account
 */
export const deleteAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      });
      return;
    }

    logger.info('User account deletion requested', { userId });

    // Soft Delete user
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
    });

    // TODO: Send account deactivation email

    logger.info('User account deactivated (soft delete)', { userId });

    res.json({
      success: true,
      message: 'Account deactivated successfully. You can restore it within 30 days by logging in.',
    });
  }
);

/**
 * Restore account
 * POST /api/v1/auth/restore
 */
export const restoreAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      return;
    }

    if (!user.deletedAt) {
      res.status(400).json({ success: false, error: { code: 'ACCOUNT_ACTIVE', message: 'Account is already active' } });
      return;
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid password' } });
      return;
    }

    // Restore account
    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: null },
    });

    logger.info('User account restored', { userId: user.id });

    // Generate tokens for immediate login
    const accessToken = generateAccessToken(user.id, email);
    const refreshToken = generateRefreshToken(user.id, email);

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        accessToken,
        refreshToken,
        expiresIn: 86400,
        message: 'Account restored successfully.',
      },
    });
  }
);

/**
 * Verify email
 * GET /api/v1/auth/verify-email
 */
export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token is required' },
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired verification token' },
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    logger.info('User email verified successfully', { userId: user.id });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.',
    });
  }
);

/**
 * Forgot Password - Send Reset Link
 * POST /api/v1/auth/forgot-password
 */
export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email is required' },
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal user existence, just say email sent if account exists
      res.json({
        success: true,
        message: 'Jika email terdaftar, kami telah mengirimkan link reset password.',
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'Jika email terdaftar, kami telah mengirimkan link reset password.',
    });
  }
);

/**
 * Reset Password
 * POST /api/v1/auth/reset-password
 */
export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Token and new password are required' },
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' },
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' },
      });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    logger.info('User password reset successfully', { userId: user.id });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login.',
    });
  }
);
