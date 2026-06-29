import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('vapid-key')
  async getVapidKey() {
    const result = await this.notificationService.getVapidKey();
    return {
      success: true,
      data: result,
    };
  }

  @Post('subscribe')
  async subscribePush(@CurrentUser() user: UserPayload, @Body() body: any) {
    const result = await this.notificationService.subscribePush(
      user.userId,
      body,
    );
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('unsubscribe')
  async unsubscribePush(@CurrentUser() user: UserPayload, @Body() body: any) {
    const result = await this.notificationService.unsubscribePush(
      user.userId,
      body,
    );
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('test')
  async sendTestNotification(@CurrentUser() user: UserPayload) {
    const result = await this.notificationService.sendNotificationToUser(
      user.userId,
      {
        title: '🔔 Notifikasi Tes',
        body: 'Selamat! Notifikasi push berhasil diaktifkan. Anda akan menerima pengingat makan dan tips nutrisi.',
        data: {
          type: 'test',
          url: '/dashboard/notifications',
        },
      },
    );

    if (result.success === 0 && result.failed === 0) {
      return {
        success: false,
        error: {
          message:
            'No push subscriptions found. Please enable push notifications first.',
        },
      };
    }

    return {
      success: true,
      message: 'Test notification sent successfully',
      data: result,
    };
  }

  @Get()
  async getNotifications(
    @CurrentUser() user: UserPayload,
    @Query() query: any,
  ) {
    const result = await this.notificationService.getNotifications(
      user.userId,
      query,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Put('read-all')
  async markAllAsRead(@CurrentUser() user: UserPayload) {
    const result = await this.notificationService.markAllAsRead(user.userId);
    return {
      success: true,
      message: result.message,
    };
  }

  @Put(':id/read')
  async markAsRead(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const result = await this.notificationService.markAsRead(user.userId, id);
    return {
      success: true,
      message: result.message,
    };
  }

  @Get('settings')
  async getSettings(@CurrentUser() user: UserPayload) {
    const settings = await this.notificationService.getSettings(user.userId);
    return {
      success: true,
      data: settings,
    };
  }

  @Put('settings')
  async updateSettings(@CurrentUser() user: UserPayload, @Body() body: any) {
    const settings = await this.notificationService.updateSettings(
      user.userId,
      body,
    );
    return {
      success: true,
      data: settings,
    };
  }
}
