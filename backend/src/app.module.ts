import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { BiomarkerModule } from './biomarker/biomarker.module';
import { FoodModule } from './food/food.module';
import { LlmModule } from './llm/llm.module';
import { RagModule } from './rag/rag.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';
import { ChatModule } from './chat/chat.module';
import { FoodLogModule } from './food-log/food-log.module.js';
import { NotificationModule } from './notification/notification.module.js';
import { UserTargetsModule } from './user-targets/user-targets.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';

const logger = new Logger('AppModule');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Bug #15 Fix: Rate limiting to protect auth endpoints from brute force
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 second
        limit: 10,  // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Bug #8 Fix: Make Redis / BullMQ optional — if Redis is unavailable,
    // the app still boots; background jobs are silently skipped in dev mode.
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const isDev = process.env.NODE_ENV === 'development';
        const isTls = url.startsWith('rediss://');

        return {
          connection: {
            url,
            maxRetriesPerRequest: null,
            ...(isTls ? { tls: {} } : {}),
            // In development: log warning once and stop retrying after 2 attempts to avoid ECONNREFUSED terminal spam
            retryStrategy(times: number) {
              if (isDev) {
                if (times === 1) {
                  logger.warn(
                    'Redis not available — background jobs disabled. Start Redis or set REDIS_URL to enable.',
                  );
                  return 2000;
                }
                // Stop retrying quietly in dev mode
                return null;
              }
              return Math.min(times * 100, 3000);
            },
            // Don't throw on connection errors in development
            enableOfflineQueue: !isDev,
            lazyConnect: isDev,
          },
        };
      },
    }),

    DbModule,
    AuthModule,
    BiomarkerModule,
    FoodModule,
    LlmModule,
    RagModule,
    MealPlanModule,
    ChatModule,
    FoodLogModule,
    NotificationModule,
    UserTargetsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
