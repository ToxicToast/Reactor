import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import type { ScheduledJob } from '../common/interfaces/index.js';
import { JobSchedules } from '../common/schedules/index.js';
import { BLOG_QUEUE, BLOG_SCHEDULES, BlogJobs } from './constants/index.js';

@Injectable()
export class BlogSchedules extends JobSchedules {
  constructor(@InjectQueue(BLOG_QUEUE) queue: Queue) {
    super(queue);
  }

  protected jobs(): ReadonlyArray<ScheduledJob> {
    return [
      {
        name: BlogJobs.MEDIA_CLEANUP,
        patternEnv: BLOG_SCHEDULES.MEDIA_CLEANUP.PATTERN_ENV,
        defaultPattern: BLOG_SCHEDULES.MEDIA_CLEANUP.DEFAULT_PATTERN,
      },
    ];
  }
}
