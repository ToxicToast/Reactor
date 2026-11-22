import type { Nullable } from '@toxictoast/shared-types';

export interface ClipFilter {
  readonly channel_id: string;
  readonly vod_id: Nullable<string>;
}
