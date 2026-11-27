import {
  POST_METRIC_KEYS,
  type PostMetrics,
} from '@toxictoast/publisher-domain';
import type { PayloadReader } from '@toxictoast/shared-kernel';

export const postMetricsOf = (metrics: PayloadReader): PostMetrics => {
  return Object.fromEntries(
    POST_METRIC_KEYS.map((key) => [key, metrics.nullableNumber(key)]),
  ) as PostMetrics;
};
