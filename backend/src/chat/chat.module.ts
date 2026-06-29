import { Module } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { ChatController } from './chat.controller.js';
import { LlmModule } from '../llm/llm.module.js';

@Module({
  imports: [LlmModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
