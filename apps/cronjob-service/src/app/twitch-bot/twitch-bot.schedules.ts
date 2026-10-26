import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { optionalEnv } from '@toxictoast/shared-system';
import type { Queue } from 'bullmq';
import { defaultJobOptionsFromEnv } from '../functions/index.js';
import { TWITCH_BOT_QUEUE, TwitchBotJobs } from './constants/index.js';

@Injectable()
export class TwitchBotSchedules implements OnApplicationBootstrap {
  private readonly logger = new Logger(TwitchBotSchedules.name);

  constructor(@InjectQueue(TWITCH_BOT_QUEUE) private readonly queue: Queue) {}

  async onApplicationBootstrap(): Promise<void> {
    const tz = optionalEnv('CRONJOB_TIMEZONE', undefined) ?? 'Europe/Berlin';

    await this.schedule(
      TwitchBotJobs.CHATTERS_SYNC,
      optionalEnv('TWITCH_CHATTERS_SYNC_CRON', undefined) ?? '* * * * *',
      tz,
    );
    await this.schedule(
      TwitchBotJobs.CLIPS_SYNC,
      optionalEnv('TWITCH_CLIPS_SYNC_CRON', undefined) ?? '*/5 * * * *',
      tz,
    );
  }

  private async schedule(
    name: string,
    pattern: string,
    tz: string,
  ): Promise<void> {
    await this.queue.upsertJobScheduler(
      name,
      { pattern, tz },
      { name, opts: { ...defaultJobOptionsFromEnv(), attempts: 1 } },
    );
    this.logger.log(`Scheduled ${name} at "${pattern}" (${tz})`);
  }
}
