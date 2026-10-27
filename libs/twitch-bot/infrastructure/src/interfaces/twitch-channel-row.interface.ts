import type { AnemicRow } from '@toxictoast/shared-persistence';

export interface TwitchChannelRow extends AnemicRow {
  twitch_id: string;
  login: string;
  display_name: string;
  scopes: Array<string>;
  connected: boolean;
}
