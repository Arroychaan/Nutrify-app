import { Module } from '@nestjs/common';
import { RagService } from './rag.service.js';
import { LlmModule } from '../llm/llm.module.js';

@Module({
  imports: [LlmModule],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
