import { numberEnv } from '@toxictoast/shared-system';
import type { DefaultJobOptions } from 'bullmq';
import { CRONJOB_DEFAULTS, CRONJOB_ENV } from '../constants/index.js';

export const defaultJobOptionsFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): DefaultJobOptions => {
  return {
    attempts:
      numberEnv(CRONJOB_ENV.JOB_RETRIES, CRONJOB_DEFAULTS.JOB_RETRIES, source) +
      1,
    backoff: {
      type: CRONJOB_DEFAULTS.JOB_BACKOFF_TYPE,
      delay: numberEnv(
        CRONJOB_ENV.JOB_BACKOFF_MS,
        CRONJOB_DEFAULTS.JOB_BACKOFF_MS,
        source,
      ),
    },
    removeOnComplete: {
      count: numberEnv(
        CRONJOB_ENV.JOB_KEEP_COMPLETED,
        CRONJOB_DEFAULTS.JOB_KEEP_COMPLETED,
        source,
      ),
    },
    removeOnFail: {
      count: numberEnv(
        CRONJOB_ENV.JOB_KEEP_FAILED,
        CRONJOB_DEFAULTS.JOB_KEEP_FAILED,
        source,
      ),
    },
  };
};
