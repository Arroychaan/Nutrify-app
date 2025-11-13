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
      },
    });

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
      },
    });
  }
);

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

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
        activityLevel: true,
        culture: true,
        religion: true,
        medicalConditions: true,
        allergies: true,
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
