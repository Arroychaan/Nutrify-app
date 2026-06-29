import { Module } from '@nestjs/common';
import { FoodLogService } from './food-log.service.js';
import { FoodLogController } from './food-log.controller.js';
import { LlmModule } from '../llm/llm.module.js';
import { FoodModule } from '../food/food.module.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [LlmModule, FoodModule, NotificationModule],
  controllers: [FoodLogController],
  providers: [FoodLogService],
})
export class FoodLogModule {}
