import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MealPlanService } from './meal-plan.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator.js';

@Controller('meal-plans')
@UseGuards(JwtAuthGuard)
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Get()
  async getMealPlans(@CurrentUser() user: UserPayload) {
    const plans = await this.mealPlanService.getMealPlans(user.userId);
    return {
      success: true,
      data: plans,
    };
  }

  @Post('generate')
  async generateMealPlan(@CurrentUser() user: UserPayload, @Body() body: any) {
    const plan = await this.mealPlanService.generateMealPlan(user.userId, body);
    return {
      success: true,
      data: plan,
    };
  }

  @Get(':mealPlanId')
  async getMealPlanById(
    @CurrentUser() user: UserPayload,
    @Param('mealPlanId') mealPlanId: string,
  ) {
    const plan = await this.mealPlanService.getMealPlanById(
      user.userId,
      mealPlanId,
    );
    return {
      success: true,
      data: plan,
    };
  }

  @Delete(':mealPlanId')
  async deleteMealPlan(
    @CurrentUser() user: UserPayload,
    @Param('mealPlanId') mealPlanId: string,
  ) {
    const result = await this.mealPlanService.deleteMealPlan(
      user.userId,
      mealPlanId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Put(':mealPlanId/feedback')
  async rateMealPlan(
    @CurrentUser() user: UserPayload,
    @Param('mealPlanId') mealPlanId: string,
  ) {
    // Mock save feedback to match original Express behavior
    return {
      success: true,
      data: {
        message: 'Feedback saved successfully',
      },
    };
  }

  @Put(':mealPlanId/swap')
  async swapMeal(
    @CurrentUser() user: UserPayload,
    @Param('mealPlanId') mealPlanId: string,
    @Body() body: any,
  ) {
    const newMeal = await this.mealPlanService.swapMeal(
      user.userId,
      mealPlanId,
      body,
    );
    return {
      success: true,
      data: newMeal,
    };
  }

  @Get(':mealPlanId/shopping-list')
  async getShoppingList(
    @CurrentUser() user: UserPayload,
    @Param('mealPlanId') mealPlanId: string,
  ) {
    const list = await this.mealPlanService.getShoppingList(
      user.userId,
      mealPlanId,
    );
    return {
      success: true,
      data: list,
    };
  }
}
