import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema.js';
import { userTransactions } from '../db/schema.js';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getUserTransactions(userId: string) {
    const transactions = await this.db.query.userTransactions.findMany({
      where: eq(userTransactions.userId, userId),
      orderBy: [desc(userTransactions.transactionDate)],
    });
    return transactions;
  }

  async getTodayTransactions(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const transactions = await this.db.query.userTransactions.findMany({
      where: and(
        eq(userTransactions.userId, userId),
        gte(userTransactions.transactionDate, startOfDay),
        lte(userTransactions.transactionDate, endOfDay),
      ),
      orderBy: [desc(userTransactions.transactionDate)],
    });
    return transactions;
  }

  async createTransaction(userId: string, data: { name: string; amount: number; category: string }) {
    const created = await this.db
      .insert(userTransactions)
      .values({
        userId,
        name: data.name,
        amount: data.amount,
        category: data.category,
        transactionDate: new Date(),
      })
      .returning();
    return created[0];
  }

  async deleteTransaction(userId: string, transactionId: string) {
    const deleted = await this.db
      .delete(userTransactions)
      .where(and(eq(userTransactions.id, transactionId), eq(userTransactions.userId, userId)))
      .returning();
    
    if (deleted.length === 0) {
      throw new NotFoundException('Transaction not found or unauthorized');
    }
    
    return { success: true };
  }
}
