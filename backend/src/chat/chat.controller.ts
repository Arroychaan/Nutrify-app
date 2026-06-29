import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator.js';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  async sendChatMessage(@CurrentUser() user: UserPayload, @Body() body: any) {
    const result = await this.chatService.sendChatMessage(user.userId, body);
    return {
      success: true,
      data: result,
    };
  }

  @Get('conversations')
  async getConversations(
    @CurrentUser() user: UserPayload,
    @Query() query: any,
  ) {
    const result = await this.chatService.getConversations(user.userId, query);
    return {
      success: true,
      data: result,
    };
  }

  @Get('conversations/:conversationId')
  async getConversation(
    @CurrentUser() user: UserPayload,
    @Param('conversationId') conversationId: string,
  ) {
    const result = await this.chatService.getConversation(
      user.userId,
      conversationId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Delete('conversations/:conversationId')
  async deleteConversation(
    @CurrentUser() user: UserPayload,
    @Param('conversationId') conversationId: string,
  ) {
    const result = await this.chatService.deleteConversation(
      user.userId,
      conversationId,
    );
    return {
      success: true,
      message: result.message,
    };
  }
}
