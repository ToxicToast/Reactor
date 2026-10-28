import type { ChannelDayCounters } from '@toxictoast/twitch-domain';

export interface ChannelDayRow extends ChannelDayCounters {
  channel_id: string;
  day: string;
  peak_chatters: number;
}
