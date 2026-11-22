import type { Nullable } from '@toxictoast/shared-types';
import type { VideoType } from '../types/index.js';

export interface Video {
  readonly video_id: string;
  readonly channel_id: string;
  readonly stream_id: Nullable<string>;
  readonly type: VideoType;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly thumbnail_url: string;
  readonly duration_seconds: number;
  readonly language: string;
  readonly created_at: Date;
  readonly published_at: Date;
}
