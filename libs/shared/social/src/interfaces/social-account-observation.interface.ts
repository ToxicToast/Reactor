import type { Nullable } from '@toxictoast/shared-types';
import type { SocialPlatform } from '../types/index.js';

export interface SocialAccountObservation {
  readonly platform: SocialPlatform;
  readonly remote_id: string;
  readonly handle: string;
  readonly display_name: Nullable<string>;
  readonly url: Nullable<string>;
  readonly followers: Nullable<number>;
  readonly media_count: Nullable<number>;
}
