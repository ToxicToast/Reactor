import { Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { optionalEnv } from '@toxictoast/shared-system';
import type { Queue } from 'bullmq';
import { defaultJobOptionsFromEnv } from '../../functions/index.js';
import type { ScheduledJob } from '../interfaces/index.js';
import { DEFAULT_TIMEZONE } from '../constants/index.js';

export abstract class JobSchedules implements OnApplicationBootstrap {
  private readonly logger = new Logger(this.constructor.name);

  protected constructor(private readonly queue: Queue) {}

  protected abstract jobs(): ReadonlyArray<ScheduledJob>;

  async onApplicationBootstrap(): Promise<void> {
    const tz = optionalEnv('CRONJOB_TIMEZONE', undefined) ?? DEFAULT_TIMEZONE;
    for (const job of this.jobs()) {
      await this.schedule(job, tz);
    }
  }

  private async schedule(job: ScheduledJob, tz: string): Promise<void> {
    const pattern =
      optionalEnv(job.patternEnv, undefined) ?? job.defaultPattern;
    const defaults = defaultJobOptionsFromEnv();
    await this.queue.upsertJobScheduler(
      job.name,
      { pattern, tz },
      {
        name: job.name,
        opts: { ...defaults, attempts: job.attempts ?? defaults.attempts },
      },
    );
    this.logger.log(`Scheduled ${job.name} at "${pattern}" (${tz})`);
  }
}
