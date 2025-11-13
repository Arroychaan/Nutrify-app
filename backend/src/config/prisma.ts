import { PrismaClient } from '@prisma/client';
import logger from '@config/logger.js';

let prisma: PrismaClient | null = null;

export function getPrismaInstance(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });
  }
  return prisma;
}

export async function initializePrisma(): Promise<PrismaClient> {
  try {
    prisma = getPrismaInstance();
    
    // Test connection - skip in development if database not available
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.info('Database connection successful');
    } catch (dbError) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Database not available in development mode - continuing without DB. Error:', dbError);
        return prisma;
      }
      throw dbError;
    }

    return prisma;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function closePrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  }
}

export default prisma;
