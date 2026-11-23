import type { AnemicRow } from '@toxictoast/shared-persistence';

export interface TwitchFriendRow extends AnemicRow {
  twitch_id: string;
  login: string;
  display_name: string;
}
