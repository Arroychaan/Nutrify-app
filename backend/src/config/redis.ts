import { createClient, RedisClientType } from 'redis';
import config from './index.js';
import logger from './logger.js';

export let redis: RedisClientType | null = null;

export async function initializeRedis() {
  try {
    // Skip Redis initialization in development mode
    if (process.env.NODE_ENV === 'development') {
      logger.info('Skipping Redis initialization in development mode');
      return null;
    }

    redis = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            logger.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 50, 500);
        },
      },
    });

    redis.on('error', (err: Error) => {
      logger.error('Redis error:', err);
    });

    redis.on('connect', () => {
      logger.info('Redis connected');
    });

    await redis.connect();
    logger.info('Redis initialized successfully');

    return redis;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    throw error;
  }
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    logger.info('Redis connection closed');
  }
}

export default redis;
