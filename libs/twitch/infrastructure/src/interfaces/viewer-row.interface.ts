import type { ViewerRef } from '@toxictoast/twitch-domain';

export interface ViewerRow extends ViewerRef {
  channel_id: string;
  last_seen_at: Date;
}
