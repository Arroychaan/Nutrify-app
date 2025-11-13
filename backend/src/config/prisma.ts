import { PrismaClient } from '@prisma/client';
import logger from '@config/logger.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
});

export function getPrismaInstance(): PrismaClient {
  return prisma;
}

export async function initializePrisma(): Promise<PrismaClient> {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection successful');
    return prisma;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function closePrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database connection closed');
}

export default prisma;
