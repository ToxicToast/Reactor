import type { Nullable } from '@toxictoast/shared-types';
import type { ChannelRef } from '@toxictoast/twitch-domain';

export interface StatsChannel extends ChannelRef {
  readonly live: boolean;
  readonly current_session_id: Nullable<string>;
  readonly last_session_at: Nullable<Date>;
}
