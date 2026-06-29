import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FoodLogService } from './food-log.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator.js';

@Controller('food-logs')
@UseGuards(JwtAuthGuard)
export class FoodLogController {
  constructor(private readonly foodLogService: FoodLogService) {}

  @Post()
  async createFoodLog(@CurrentUser() user: UserPayload, @Body() body: any) {
    const foodLog = await this.foodLogService.createFoodLog(user.userId, body);
    return {
      success: true,
      data: foodLog,
    };
  }

  @Get()
  async getFoodLogsByDate(
    @CurrentUser() user: UserPayload,
    @Query() query: any,
  ) {
    const result = await this.foodLogService.getFoodLogsByDate(
      user.userId,
      query,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('summary')
  async getFoodLogsSummary(
    @CurrentUser() user: UserPayload,
    @Query() query: any,
  ) {
    const result = await this.foodLogService.getFoodLogsSummary(
      user.userId,
      query,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('today')
  async getTodaySummary(@CurrentUser() user: UserPayload, @Query() query: any) {
    const result = await this.foodLogService.getTodaySummary(
      user.userId,
      query,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Put('water')
  async updateWaterLog(@CurrentUser() user: UserPayload, @Body() body: any) {
    const result = await this.foodLogService.updateWaterLog(user.userId, body);
    return {
      success: true,
      data: result,
    };
  }

  @Get('water')
  async getWaterLog(@CurrentUser() user: UserPayload, @Query() query: any) {
    const result = await this.foodLogService.getWaterLog(user.userId, query);
    return {
      success: true,
      data: result,
    };
  }

  @Put(':id')
  async updateFoodLog(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const updated = await this.foodLogService.updateFoodLog(
      user.userId,
      id,
      body,
    );
    return {
      success: true,
      data: updated,
    };
  }

  @Delete(':id')
  async deleteFoodLog(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    const result = await this.foodLogService.deleteFoodLog(user.userId, id);
    return {
      success: true,
      message: result.message,
    };
  }
}
