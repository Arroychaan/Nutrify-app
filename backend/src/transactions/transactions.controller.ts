import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getAllTransactions(@Req() req) {
    const userId = req.user.id;
    const data = await this.transactionsService.getUserTransactions(userId);
    return { success: true, data };
  }

  @Get('today')
  async getTodayTransactions(@Req() req) {
    const userId = req.user.id;
    const data = await this.transactionsService.getTodayTransactions(userId);
    return { success: true, data };
  }

  @Post()
  async createTransaction(
    @Req() req,
    @Body() body: { name: string; amount: number; category: string },
  ) {
    const userId = req.user.id;
    const data = await this.transactionsService.createTransaction(userId, body);
    return { success: true, data };
  }

  @Delete(':id')
  async deleteTransaction(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    await this.transactionsService.deleteTransaction(userId, id);
    return { success: true };
  }
}
