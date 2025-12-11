import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import config from './config/index.js';
import logger from './config/logger.js';
import { initializePrisma, closePrisma } from './config/prisma.js';
import { initializeRedis, closeRedis } from './config/redis.js';

import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import foodLogRoutes from './routes/foodLogRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { initializeSchedulers, stopSchedulers } from './services/schedulerService.js';

export async function createApp(): Promise<Application> {
  try {
    logger.info('Creating Express application...');
    const app = express();

    // ============================================================================
    // Middleware Setup
    // ============================================================================

    // Security headers
    app.use(helmet());

    // CORS - local development only
    app.use(
      cors({
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
        credentials: true,
      })
    );

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Rate limiting - more lenient in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    const limiter = rateLimit({
      windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 min in dev, 15 min in prod
      max: isDevelopment ? 1000 : 100, // 1000 requests in dev, 100 in prod
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      // Skip rate limiting for localhost in development
      skip: (req) => {
        if (isDevelopment) {
          const ip = req.ip || req.socket.remoteAddress || '';
          return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
        }
        return false;
      },
    });
    app.use('/api/', limiter);

    // Disable caching for API responses in development
    if (isDevelopment) {
      app.use('/api/', (req: Request, res: Response, next: NextFunction) => {
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        });
        next();
      });
    }

    // Request logging
    app.use(requestLogger);

    // ============================================================================
    // Health Check
    // ============================================================================
    app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
      });
    });

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
    app.use('/api/v1/food-logs', foodLogRoutes);
    app.use('/api/v1/foods', foodRoutes);
    app.use('/api/v1/notifications', notificationRoutes);

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

    // Initialize notification schedulers
    initializeSchedulers();

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

    // Stop notification schedulers
    stopSchedulers();

    await closePrisma();
    await closeRedis();

    logger.info('Application shutdown complete');
  } catch (error) {
    logger.error('Error during shutdown:', error);
    throw error;
  }
}
