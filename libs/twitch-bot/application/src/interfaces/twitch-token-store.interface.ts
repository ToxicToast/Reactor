import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchToken } from './twitch-token.interface.js';

export interface TwitchTokenStore {
  save(channelId: TwitchChannelId, token: TwitchToken): Promise<void>;
  find(channelId: TwitchChannelId): Promise<Nullable<TwitchToken>>;
  remove(channelId: TwitchChannelId): Promise<void>;
}
