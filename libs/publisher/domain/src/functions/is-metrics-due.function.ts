import type { Nullable } from '@toxictoast/shared-types';
import { metricsIntervalOf } from './metrics-interval-of.function.js';

/** noch nie abgefragt ist immer fällig */
export const isMetricsDue = (
  publishedAt: Date,
  checkedAt: Nullable<Date>,
  now: Date,
): boolean => {
  if (checkedAt === null) {
    return true;
  }
  return (
    now.getTime() - checkedAt.getTime() >= metricsIntervalOf(publishedAt, now)
  );
};
