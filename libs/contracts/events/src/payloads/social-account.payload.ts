import type { Nullable } from '@toxictoast/shared-types';
import type { SocialPlatformV1 } from './social-platform.payload.js';

/** Zeitpunkt der Messung ist occurred_at im Umschlag */
export interface SocialAccountPayloadV1 {
  readonly platform: SocialPlatformV1;
  readonly remote_id: string;
  readonly handle: string;
  readonly display_name: Nullable<string>;
  readonly url: Nullable<string>;
  /** Abonnenten bzw. Follower */
  readonly followers: Nullable<number>;
  /** Anzahl veröffentlichter Videos bzw. Beiträge */
  readonly media_count: Nullable<number>;
}
