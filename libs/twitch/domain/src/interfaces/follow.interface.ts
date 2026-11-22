import type { Nullable } from '@toxictoast/shared-types';
import type { ViewerRef } from './viewer-ref.interface.js';

export interface Follow extends ViewerRef {
  readonly channel_id: string;
  readonly followed_at: Date;
  readonly unfollowed_at: Nullable<Date>;
}
