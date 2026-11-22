import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchVideoTypes } from '../constants/twitch-video-types.constant.js';

export interface TwitchVideoPayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly video_id: string;
  /** nur bei Archiven gesetzt */
  readonly stream_id: Nullable<string>;
  readonly type: (typeof TwitchVideoTypes)[keyof typeof TwitchVideoTypes];
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly thumbnail_url: string;
  readonly duration_seconds: number;
  readonly language: string;
  readonly created_at: string;
  readonly published_at: string;
}
