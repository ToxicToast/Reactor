import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { optionalEnv } from '@toxictoast/shared-system';
import type { Queue } from 'bullmq';
import { defaultJobOptionsFromEnv } from '../functions/index.js';
import { BLOG_QUEUE, BlogJobs } from './constants/index.js';

@Injectable()
export class BlogSchedules implements OnApplicationBootstrap {
  private readonly logger = new Logger(BlogSchedules.name);

  constructor(@InjectQueue(BLOG_QUEUE) private readonly queue: Queue) {}

  async onApplicationBootstrap(): Promise<void> {
    const pattern =
      optionalEnv('BLOG_MEDIA_CLEANUP_CRON', undefined) ?? '0 3 * * *';
    const tz = optionalEnv('CRONJOB_TIMEZONE', undefined) ?? 'Europe/Berlin';

    await this.queue.upsertJobScheduler(
      BlogJobs.MEDIA_CLEANUP,
      { pattern, tz },
      { name: BlogJobs.MEDIA_CLEANUP, opts: defaultJobOptionsFromEnv() },
    );
    this.logger.log(
      `Scheduled ${BlogJobs.MEDIA_CLEANUP} at "${pattern}" (${tz})`,
    );
  }
}
