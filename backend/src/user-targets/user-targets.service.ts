import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema.js';
import { userTargets } from '../db/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserTargetsService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getTargets(userId: string) {
    const targets = await this.db.query.userTargets.findFirst({
      where: eq(userTargets.userId, userId),
    });

    if (!targets) {
      // Return defaults if none exist
      return {
        dailyCalorieTarget: 1800,
        dailyBudget: 50000,
      };
    }

    return targets;
  }

  async updateTargets(userId: string, data: { dailyCalorieTarget?: number; dailyBudget?: number }) {
    const existing = await this.db.query.userTargets.findFirst({
      where: eq(userTargets.userId, userId),
    });

    if (existing) {
      const updated = await this.db
        .update(userTargets)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(userTargets.userId, userId))
        .returning();
      return updated[0];
    } else {
      const created = await this.db
        .insert(userTargets)
        .values({
          userId,
          dailyCalorieTarget: data.dailyCalorieTarget ?? 1800,
          dailyBudget: data.dailyBudget ?? 50000,
        })
        .returning();
      return created[0];
    }
  }
}
