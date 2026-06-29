import { Module } from '@nestjs/common';
import { BiomarkerService } from './biomarker.service.js';
import { BiomarkerController } from './biomarker.controller.js';

@Module({
  controllers: [BiomarkerController],
  providers: [BiomarkerService],
})
export class BiomarkerModule {}
