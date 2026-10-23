import { numberEnv } from '@toxictoast/shared-system';
import type { DefaultJobOptions } from 'bullmq';

export const defaultJobOptionsFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): DefaultJobOptions => {
  return {
    attempts: numberEnv('JOB_RETRIES', 3, source) + 1,
    backoff: {
      type: 'exponential',
      delay: numberEnv('JOB_BACKOFF_MS', 30000, source),
    },
    removeOnComplete: { count: numberEnv('JOB_KEEP_COMPLETED', 100, source) },
    removeOnFail: { count: numberEnv('JOB_KEEP_FAILED', 500, source) },
  };
};
