import { METRICS_SCHEDULE } from '../constants/index.js';

export const metricsIntervalOf = (publishedAt: Date, now: Date): number => {
  const age = now.getTime() - publishedAt.getTime();
  const tier = METRICS_SCHEDULE.INTERVALS.find((candidate) => {
    return age < candidate.max_age_ms;
  });
  return tier?.interval_ms ?? METRICS_SCHEDULE.FALLBACK_INTERVAL_MS;
};
