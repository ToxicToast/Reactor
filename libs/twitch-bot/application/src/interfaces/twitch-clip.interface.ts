import type { Nullable } from '@toxictoast/shared-types';

export interface TwitchClip {
  readonly clip_id: string;
  readonly url: string;
  readonly title: string;
  readonly creator_id: string;
  readonly creator_name: string;
  readonly duration_seconds: number;
  readonly view_count: number;
  readonly thumbnail_url: string;
  readonly vod_id: Nullable<string>;
  readonly created_at: Date;
}
