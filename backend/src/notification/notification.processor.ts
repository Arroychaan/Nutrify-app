import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationService } from './notification.service.js';
import { Inject, Logger } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema.js';
import { users } from '../db/schema.js';
import { lte, isNotNull, and } from 'drizzle-orm';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private notificationService: NotificationService,
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing background notification job: ${job.name}`);

    if (job.name === 'meal-reminder') {
      const { mealType } = job.data;

      const targetUsers = await this.db.query.users.findMany({
        with: {
          notificationSettings: true,
        },
      });

      for (const u of targetUsers) {
        if (u.notificationSettings?.mealReminders) {
          await this.notificationService.sendMealReminder(u.id, mealType);
        }
      }
    } else if (job.name === 'permanent-account-deletion') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await this.db
        .delete(users)
        .where(
          and(isNotNull(users.deletedAt), lte(users.deletedAt, thirtyDaysAgo)),
        );

      this.logger.log(
        `Background clean: permanently deleted old inactive accounts.`,
      );
      return deleted;
    }
  }
}
