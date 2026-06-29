import { Module } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service.js';
import { MealPlanController } from './meal-plan.controller.js';
import { RagModule } from '../rag/rag.module.js';

@Module({
  imports: [RagModule],
  controllers: [MealPlanController],
  providers: [MealPlanService],
})
export class MealPlanModule {}
