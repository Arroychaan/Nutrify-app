import { Module } from '@nestjs/common';
import { UserTargetsService } from './user-targets.service.js';
import { UserTargetsController } from './user-targets.controller.js';

@Module({
  controllers: [UserTargetsController],
  providers: [UserTargetsService],
  exports: [UserTargetsService],
})
export class UserTargetsModule {}
