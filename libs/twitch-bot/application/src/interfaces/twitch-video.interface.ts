import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchVideoType } from '../types/index.js';

export interface TwitchVideo {
  readonly video_id: string;
  readonly stream_id: Nullable<string>;
  readonly type: TwitchVideoType;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly thumbnail_url: string;
  readonly duration_seconds: number;
  readonly language: string;
  readonly created_at: Date;
  readonly published_at: Date;
}
