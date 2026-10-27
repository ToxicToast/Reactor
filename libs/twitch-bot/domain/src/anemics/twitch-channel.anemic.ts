import type { Anemic } from '@toxictoast/shared-kernel';
import type { TwitchChannelId } from '../types/index.js';

export interface TwitchChannelAnemic extends Anemic<TwitchChannelId> {
  readonly twitch_id: string;
  readonly login: string;
  readonly display_name: string;
  readonly scopes: ReadonlyArray<string>;
  readonly connected: boolean;
}
