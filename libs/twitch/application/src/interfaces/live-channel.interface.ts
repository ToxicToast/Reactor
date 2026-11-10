import type { Nullable } from '@toxictoast/shared-types';
import type { ChannelRef } from '@toxictoast/twitch-domain';

export interface LiveChannel extends ChannelRef {
  readonly live: boolean;
  readonly session_id: Nullable<string>;
  readonly started_at: Nullable<Date>;
  readonly chatters: number;
}
