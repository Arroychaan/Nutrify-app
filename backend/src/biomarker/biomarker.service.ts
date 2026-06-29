import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema.js';
import { biomarkerRecords, users } from '../db/schema.js';
import { eq, and, isNotNull, asc } from 'drizzle-orm';

@Injectable()
export class BiomarkerService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getWeightHistory(userId: string) {
    const records = await this.db
      .select({
        id: biomarkerRecords.id,
        weightKg: biomarkerRecords.weightKg,
        recordedAt: biomarkerRecords.recordedAt,
        source: biomarkerRecords.source,
      })
      .from(biomarkerRecords)
      .where(
        and(
          eq(biomarkerRecords.userId, userId),
          isNotNull(biomarkerRecords.weightKg),
        ),
      )
      .orderBy(asc(biomarkerRecords.recordedAt));

    return records;
  }

  async logWeight(userId: string, body: any) {
    const { weightKg, date } = body;

    if (!weightKg) {
      throw new BadRequestException('Weight is required');
    }

    const recordDate = date ? new Date(date) : new Date();
    const weightDecimal = Number(weightKg).toFixed(2);

    // Drizzle Transaction to guarantee atomicity
    const record = await this.db.transaction(async (tx) => {
      const [insertedRecord] = await tx
        .insert(biomarkerRecords)
        .values({
          userId,
          weightKg: weightDecimal,
          recordedAt: recordDate,
          source: 'user_input',
        })
        .returning();

      await tx
        .update(users)
        .set({ currentWeightKg: weightDecimal })
        .where(eq(users.id, userId));

      return insertedRecord;
    });

    return record;
  }
}
