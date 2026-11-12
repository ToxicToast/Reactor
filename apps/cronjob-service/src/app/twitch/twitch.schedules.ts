import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import type { ScheduledJob } from '../common/interfaces/index.js';
import { JobSchedules } from '../common/schedules/index.js';
import { TWITCH_QUEUE, TwitchJobs } from './constants/index.js';

@Injectable()
export class TwitchSchedules extends JobSchedules {
  constructor(@InjectQueue(TWITCH_QUEUE) queue: Queue) {
    super(queue);
  }

  protected jobs(): ReadonlyArray<ScheduledJob> {
    return [
      {
        name: TwitchJobs.CHAT_PURGE_EXPIRED,
        patternEnv: 'TWITCH_CHAT_PURGE_CRON',
        defaultPattern: '45 3 * * *',
      },
    ];
  }
}
