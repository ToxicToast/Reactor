import type { Nullable } from '@toxictoast/shared-types';

export interface YouTubeChannelPayloadV1 {
  readonly id: string;
  readonly youtube_id: string;
  readonly handle: Nullable<string>;
  readonly title: string;
  readonly scopes: ReadonlyArray<string>;
  readonly connected: boolean;
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
