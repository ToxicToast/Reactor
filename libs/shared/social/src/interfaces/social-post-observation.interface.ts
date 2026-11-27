import type { Nullable } from '@toxictoast/shared-types';
import type { SocialPlatform, SocialPostMetrics } from '../types/index.js';

export interface SocialPostObservation {
  readonly platform: SocialPlatform;
  readonly remote_id: string;
  readonly account_remote_id: string;
  readonly url: string;
  readonly title: Nullable<string>;
  readonly published_at: Date;
  readonly duration_seconds: Nullable<number>;
  readonly metrics: SocialPostMetrics;
}
