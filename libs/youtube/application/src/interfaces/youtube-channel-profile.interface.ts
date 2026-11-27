import type { Nullable } from '@toxictoast/shared-types';

/** der eigene Kanal, wie channels.list ihn liefert */
export interface YouTubeChannelProfile {
  readonly youtube_id: string;
  readonly handle: Nullable<string>;
  readonly title: string;
  /** null, wenn der Kanal die Abozahl verbirgt */
  readonly subscribers: Nullable<number>;
  readonly video_count: Nullable<number>;
}
