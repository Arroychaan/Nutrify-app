import { Module } from '@nestjs/common';
import { FoodService } from './food.service.js';
import { FoodController } from './food.controller.js';
import { GroundTruthService } from './ground-truth.service.js';

@Module({
  controllers: [FoodController],
  providers: [FoodService, GroundTruthService],
  exports: [FoodService, GroundTruthService],
})
export class FoodModule {}
