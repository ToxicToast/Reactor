import type { Nullable } from '@toxictoast/shared-types';
import type { SocialPlatformV1 } from './social-platform.payload.js';
import type { SocialPostMetricsV1 } from './social-post-metrics.payload.js';

/** Zeitpunkt der Messung ist occurred_at im Umschlag; die Herkunft entscheidet der publisher-service */
export interface SocialPostPayloadV1 {
  readonly platform: SocialPlatformV1;
  readonly remote_id: string;
  readonly account_remote_id: string;
  readonly url: string;
  readonly title: Nullable<string>;
  /** ISO 8601 */
  readonly published_at: string;
  readonly duration_seconds: Nullable<number>;
  readonly metrics: SocialPostMetricsV1;
}
