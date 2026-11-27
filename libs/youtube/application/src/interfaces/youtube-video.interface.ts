import type { Nullable } from '@toxictoast/shared-types';

/** was videos.list mit snippet, contentDetails und statistics liefert */
export interface YouTubeVideo {
  readonly video_id: string;
  readonly title: string;
  readonly published_at: Date;
  readonly duration_seconds: Nullable<number>;
  readonly views: Nullable<number>;
  /** null, wenn Likes ausgeblendet sind */
  readonly likes: Nullable<number>;
  /** null, wenn Kommentare abgeschaltet sind */
  readonly comments: Nullable<number>;
}
