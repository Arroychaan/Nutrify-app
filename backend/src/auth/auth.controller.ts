import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser, UserPayload } from './current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    const result = await this.authService.register(body);
    return {
      success: true,
      data: result,
    };
  }

  @Post('login')
  async login(@Body() body: any) {
    const result = await this.authService.login(body);
    return {
      success: true,
      data: result,
    };
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    const result = await this.authService.refreshToken(body);
    return {
      success: true,
      data: result,
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const result = await this.authService.verifyEmail(token);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    const result = await this.authService.forgotPassword(body);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    const result = await this.authService.resetPassword(body);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('restore')
  async restore(@Body() body: any) {
    const result = await this.authService.restoreAccount(body);
    return {
      success: true,
      data: result,
    };
  }

  // Protected routes
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: UserPayload) {
    return {
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: UserPayload) {
    const result = await this.authService.getMe(user.userId);
    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@CurrentUser() user: UserPayload, @Body() body: any) {
    const result = await this.authService.updateProfile(user.userId, body);
    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('password')
  async changePassword(@CurrentUser() user: UserPayload, @Body() body: any) {
    const result = await this.authService.changePassword(user.userId, body);
    return {
      success: true,
      message: result.message,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async deleteAccount(@CurrentUser() user: UserPayload) {
    const result = await this.authService.deleteAccount(user.userId);
    return {
      success: true,
      message: result.message,
    };
  }

  // 2FA Routes
  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generate2FASecret(@CurrentUser() user: UserPayload) {
    const result = await this.authService.generate2FASecret(user.userId);
    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verify2FA(
    @CurrentUser() user: UserPayload,
    @Body('token') token: string,
  ) {
    const result = await this.authService.verify2FA(user.userId, token);
    return {
      success: true,
      message: result.message,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disable2FA(@CurrentUser() user: UserPayload, @Body() body: any) {
    const result = await this.authService.disable2FA(user.userId, body);
    return {
      success: true,
      message: result.message,
    };
  }
}
