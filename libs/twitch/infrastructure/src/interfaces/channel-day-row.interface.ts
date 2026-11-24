import type { Nullable } from '@toxictoast/shared-types';
import type { ChannelDayCounters } from '@toxictoast/twitch-domain';

export interface ChannelDayRow extends ChannelDayCounters {
  channel_id: string;
  day: string;
  peak_chatters: number;
  follower_total: Nullable<number>;
}
