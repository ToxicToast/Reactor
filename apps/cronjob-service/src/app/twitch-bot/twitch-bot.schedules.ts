import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import type { ScheduledJob } from '../common/interfaces/index.js';
import { JobSchedules } from '../common/schedules/index.js';
import {
  TWITCH_BOT_JOB_ATTEMPTS,
  TWITCH_BOT_QUEUE,
  TWITCH_BOT_SCHEDULES,
  TwitchBotJobs,
} from './constants/index.js';

@Injectable()
export class TwitchBotSchedules extends JobSchedules {
  constructor(@InjectQueue(TWITCH_BOT_QUEUE) queue: Queue) {
    super(queue);
  }

  protected jobs(): ReadonlyArray<ScheduledJob> {
    return [
      {
        name: TwitchBotJobs.CHATTERS_SYNC,
        patternEnv: TWITCH_BOT_SCHEDULES.CHATTERS_SYNC.PATTERN_ENV,
        defaultPattern: TWITCH_BOT_SCHEDULES.CHATTERS_SYNC.DEFAULT_PATTERN,
        attempts: TWITCH_BOT_JOB_ATTEMPTS.SYNC,
      },
      {
        name: TwitchBotJobs.CLIPS_SYNC,
        patternEnv: TWITCH_BOT_SCHEDULES.CLIPS_SYNC.PATTERN_ENV,
        defaultPattern: TWITCH_BOT_SCHEDULES.CLIPS_SYNC.DEFAULT_PATTERN,
        attempts: TWITCH_BOT_JOB_ATTEMPTS.SYNC,
      },
    ];
  }
}
