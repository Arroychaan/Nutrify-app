import 'tsconfig-paths/register';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import config from './config/index.js';
import logger from './config/logger.js';
import { initializePrisma, closePrisma } from './config/prisma.js';
import { initializeRedis, closeRedis } from './config/redis.js';

import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';

export async function createApp(): Promise<Application> {
  try {
    logger.info('Creating Express application...');
    const app = express();

    // ============================================================================
    // Middleware Setup
    // ============================================================================

    // Security headers
    app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);

  // Request logging
  app.use(requestLogger);

  // ============================================================================
  // Health Check
  // ============================================================================
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'OK',
      timestamp: new Date(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    });
  });

  // ============================================================================
  // API Routes
  // ============================================================================
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/chat', chatRoutes);
  app.use('/api/v1/meal-plans', mealPlanRoutes);

  // ============================================================================
  // 404 Handler
  // ============================================================================
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.path} not found`,
      },
    });
  });

  // ============================================================================
  // Error Handler
  // ============================================================================
  app.use(errorHandler);

  logger.info('Express application created successfully');
  return app;
  } catch (error) {
    logger.error('Failed to create Express application:', error);
    throw error;
  }
}

export async function initializeApp(): Promise<Application> {
  try {
    logger.info('Initializing application...');

    // Initialize database (skip in development if not available)
    if (process.env.NODE_ENV !== 'development') {
      await initializePrisma();
    } else {
      try {
        await initializePrisma();
      } catch (error) {
        logger.warn('Skipping database initialization in development mode');
      }
    }

    // Initialize Redis
    await initializeRedis();

    // Create Express app
    const app = await createApp();

    logger.info('Application initialized successfully');

    return app;
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    throw error;
  }
}

export async function shutdownApp(): Promise<void> {
  try {
    logger.info('Shutting down application...');

    await closePrisma();
    await closeRedis();

    logger.info('Application shutdown complete');
  } catch (error) {
    logger.error('Error during shutdown:', error);
    throw error;
  }
}
