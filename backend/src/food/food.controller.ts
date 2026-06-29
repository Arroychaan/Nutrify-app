import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FoodService } from './food.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('foods')
@UseGuards(JwtAuthGuard)
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get('search')
  async searchFoods(@Query() query: any) {
    const result = await this.foodService.searchFoods(query);
    return {
      success: true,
      data: result.foods,
      pagination: result.pagination,
    };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.foodService.getCategories();
    return {
      success: true,
      data: categories.map((c) => ({
        category: c.category,
        count: c.count,
      })),
    };
  }

  @Get('category/:category')
  async getFoodsByCategory(
    @Param('category') category: string,
    @Query() query: any,
  ) {
    const result = await this.foodService.getFoodsByCategory(category, query);
    return {
      success: true,
      data: result.foods,
      pagination: result.pagination,
    };
  }

  @Post('nutrition')
  async getNutritionBulk(@Body() body: any) {
    const foods = await this.foodService.getNutritionBulk(body);
    return {
      success: true,
      data: foods,
    };
  }

  @Get('suggestions')
  async getFoodSuggestions(@Query() query: any) {
    const foods = await this.foodService.getFoodSuggestions(query);
    return {
      success: true,
      data: foods,
    };
  }

  @Get('stats')
  async getFoodStats() {
    const stats = await this.foodService.getFoodStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Post('filter')
  async filterFoods(@Body() body: any) {
    const result = await this.foodService.filterFoods(body);
    return {
      success: true,
      data: result.foods,
      filters: result.filters,
    };
  }

  @Get(':id')
  async getFoodById(@Param('id') id: string) {
    const food = await this.foodService.getFoodById(id);
    return {
      success: true,
      data: food,
    };
  }
}
