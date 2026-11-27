import type { MetricValues } from '@toxictoast/shared-kernel';
import type { SOCIAL_POST_METRIC_KEYS } from '../constants/index.js';

export type SocialPostMetrics = MetricValues<
  (typeof SOCIAL_POST_METRIC_KEYS)[number]
>;
