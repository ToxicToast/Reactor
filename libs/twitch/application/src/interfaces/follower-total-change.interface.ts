import type { ChannelRef } from '@toxictoast/twitch-domain';

export interface FollowerTotalChange {
  readonly channel: ChannelRef;
  readonly total: number;
  readonly observed_at: Date;
}
