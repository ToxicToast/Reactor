import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import type { ScheduledJob } from '../common/interfaces/index.js';
import { JobSchedules } from '../common/schedules/index.js';
import { AUDIT_QUEUE, AUDIT_SCHEDULES, AuditJobs } from './constants/index.js';

@Injectable()
export class AuditSchedules extends JobSchedules {
  constructor(@InjectQueue(AUDIT_QUEUE) queue: Queue) {
    super(queue);
  }

  protected jobs(): ReadonlyArray<ScheduledJob> {
    return [
      {
        name: AuditJobs.PURGE_EXPIRED,
        patternEnv: AUDIT_SCHEDULES.PURGE_EXPIRED.PATTERN_ENV,
        defaultPattern: AUDIT_SCHEDULES.PURGE_EXPIRED.DEFAULT_PATTERN,
      },
    ];
  }
}
