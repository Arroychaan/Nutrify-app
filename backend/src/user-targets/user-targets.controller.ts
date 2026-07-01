import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UserTargetsService } from './user-targets.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('user-targets')
@UseGuards(JwtAuthGuard)
export class UserTargetsController {
  constructor(private readonly userTargetsService: UserTargetsService) {}

  @Get()
  async getTargets(@Req() req) {
    const userId = req.user.id;
    const data = await this.userTargetsService.getTargets(userId);
    return { success: true, data };
  }

  @Put()
  async updateTargets(
    @Req() req,
    @Body() body: { dailyCalorieTarget?: number; dailyBudget?: number },
  ) {
    const userId = req.user.id;
    const data = await this.userTargetsService.updateTargets(userId, body);
    return { success: true, data };
  }
}
