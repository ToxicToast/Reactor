import type { Nullable } from '@toxictoast/shared-types';
import type { YouTubeChannelId } from '../types/index.js';

export interface YouTubeChannelEventPayload {
  readonly id: YouTubeChannelId;
  readonly youtube_id: string;
  readonly handle: Nullable<string>;
  readonly title: string;
  readonly scopes: ReadonlyArray<string>;
  readonly connected: boolean;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
