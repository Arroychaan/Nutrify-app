import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Prevent uncaught exceptions (like Redis connection/DNS lookup errors during startup) from crashing the server
process.on('uncaughtException', (err) => {
  console.warn('[Process] Uncaught Exception caught safely:', err.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.warn('[Process] Unhandled Rejection caught safely:', reason);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global route prefix to match the Express API (e.g. /api/v1/auth)
  app.setGlobalPrefix('api/v1');

  // Enable CORS with support for frontend origins
  app.enableCors({
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap().catch((err) => {
  console.error('Error starting server:', err);
});
