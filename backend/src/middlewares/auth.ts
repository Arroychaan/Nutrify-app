import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@utils/jwt.js';
import logger from '@config/logger.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      email?: string;
    }
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_NO_TOKEN',
          message: 'No authorization token provided',
        },
      });
      return;
    }

    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    req.email = payload.email;

    next();
  } catch (error) {
    logger.warn('Token verification failed:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const payload = verifyAccessToken(token);
      req.userId = payload.userId;
      req.email = payload.email;
    }

    next();
  } catch (error) {
    logger.debug('Optional auth failed, continuing without auth');
    next();
  }
}
