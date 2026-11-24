import { FOLLOWER_TOTAL_METRIC } from './follower-total-metric.constant.js';
import { PEAK_CHATTERS_METRIC } from './peak-chatters-metric.constant.js';

export const GAUGE_METRICS: ReadonlySet<string> = new Set([
  PEAK_CHATTERS_METRIC,
  FOLLOWER_TOTAL_METRIC,
]);
