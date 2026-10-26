import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { optionalEnv } from '@toxictoast/shared-system';
import type { Queue } from 'bullmq';
import { defaultJobOptionsFromEnv } from '../functions/index.js';
import { AUDIT_QUEUE, AuditJobs } from './constants/index.js';

@Injectable()
export class AuditSchedules implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuditSchedules.name);

  constructor(@InjectQueue(AUDIT_QUEUE) private readonly queue: Queue) {}

  async onApplicationBootstrap(): Promise<void> {
    const pattern = optionalEnv('AUDIT_PURGE_CRON', undefined) ?? '30 3 * * *';
    const tz = optionalEnv('CRONJOB_TIMEZONE', undefined) ?? 'Europe/Berlin';

    await this.queue.upsertJobScheduler(
      AuditJobs.PURGE_EXPIRED,
      { pattern, tz },
      { name: AuditJobs.PURGE_EXPIRED, opts: defaultJobOptionsFromEnv() },
    );
    this.logger.log(
      `Scheduled ${AuditJobs.PURGE_EXPIRED} at "${pattern}" (${tz})`,
    );
  }
}
