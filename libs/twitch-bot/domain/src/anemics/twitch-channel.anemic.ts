import type { ConnectedAccountAnemic } from '@toxictoast/shared-kernel';
import type { TwitchChannelId } from '../types/index.js';

export interface TwitchChannelAnemic extends ConnectedAccountAnemic<TwitchChannelId> {
  readonly twitch_id: string;
  readonly login: string;
  readonly display_name: string;
}
