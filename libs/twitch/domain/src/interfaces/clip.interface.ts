import type { Nullable } from '@toxictoast/shared-types';

export interface Clip {
  readonly clip_id: string;
  readonly channel_id: string;
  readonly url: string;
  readonly title: string;
  readonly creator_id: string;
  readonly creator_name: string;
  readonly duration_seconds: number;
  readonly thumbnail_url: string;
  readonly vod_id: Nullable<string>;
  readonly vod_offset: Nullable<number>;
  readonly created_at: Date;
}
