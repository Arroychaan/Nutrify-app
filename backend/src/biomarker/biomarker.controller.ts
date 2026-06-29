import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BiomarkerService } from './biomarker.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator.js';

@Controller('biomarkers')
@UseGuards(JwtAuthGuard)
export class BiomarkerController {
  constructor(private readonly biomarkerService: BiomarkerService) {}

  @Get('weight/history')
  async getWeightHistory(@CurrentUser() user: UserPayload) {
    const records = await this.biomarkerService.getWeightHistory(user.userId);
    return {
      success: true,
      data: records,
    };
  }

  @Post('weight')
  async logWeight(@CurrentUser() user: UserPayload, @Body() body: any) {
    const record = await this.biomarkerService.logWeight(user.userId, body);
    return {
      success: true,
      data: record,
    };
  }
}
