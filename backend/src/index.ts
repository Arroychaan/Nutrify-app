import 'dotenv/config';
import 'tsconfig-paths/register';
import config from '@config/index.js';
import logger from '@config/logger.js';
import { initializeApp, shutdownApp } from '@/app.js';

async function bootstrap() {
  try {
    logger.info(`Starting Nutrify Backend in ${config.nodeEnv} mode`, {
      port: config.port,
      environment: config.nodeEnv,
    });

    const app = await initializeApp();

    const server = app.listen(config.port, () => {
      logger.info(`Server is running on http://localhost:${config.port}`);
      logger.info(`API Documentation: http://localhost:${config.port}/api/docs`);
    });

    // Graceful shutdown
    const handleShutdown = async () => {
      logger.info('Received shutdown signal...');
      server.close(async () => {
        await shutdownApp();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Fatal error during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
