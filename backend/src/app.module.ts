import { Module } from '@nestjs/common';
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
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const isTls = url.startsWith('rediss://');
        return {
          connection: {
            url,
            maxRetriesPerRequest: null,
            ...(isTls ? { tls: {} } : {}),
            retryStrategy(times) {
              // Di development, kurangi spam log jika Redis tidak jalan (retry setiap 30 detik)
              if (process.env.NODE_ENV === 'development') {
                return 30000;
              }
              return Math.min(times * 100, 3000);
            },
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
