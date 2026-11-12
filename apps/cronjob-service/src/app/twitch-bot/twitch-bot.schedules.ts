import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import type { ScheduledJob } from '../common/interfaces/index.js';
import { JobSchedules } from '../common/schedules/index.js';
import { TWITCH_BOT_QUEUE, TwitchBotJobs } from './constants/index.js';

/** Sync-Jobs laufen minütlich bzw. alle 5 Minuten, ein Retry bringt da nichts */
const NO_RETRY = 1;

@Injectable()
export class TwitchBotSchedules extends JobSchedules {
  constructor(@InjectQueue(TWITCH_BOT_QUEUE) queue: Queue) {
    super(queue);
  }

  protected jobs(): ReadonlyArray<ScheduledJob> {
    return [
      {
        name: TwitchBotJobs.CHATTERS_SYNC,
        patternEnv: 'TWITCH_CHATTERS_SYNC_CRON',
        defaultPattern: '* * * * *',
        attempts: NO_RETRY,
      },
      {
        name: TwitchBotJobs.CLIPS_SYNC,
        patternEnv: 'TWITCH_CLIPS_SYNC_CRON',
        defaultPattern: '*/5 * * * *',
        attempts: NO_RETRY,
      },
    ];
  }
}
