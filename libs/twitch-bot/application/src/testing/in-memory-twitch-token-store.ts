import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import type { TwitchToken, TwitchTokenStore } from '../interfaces/index.js';

export class InMemoryTwitchTokenStore implements TwitchTokenStore {
  readonly items = new Map<TwitchChannelId, TwitchToken>();

  async save(channelId: TwitchChannelId, token: TwitchToken): Promise<void> {
    this.items.set(channelId, token);
  }

  async find(channelId: TwitchChannelId): Promise<Nullable<TwitchToken>> {
    return this.items.get(channelId) ?? null;
  }

  async remove(channelId: TwitchChannelId): Promise<void> {
    this.items.delete(channelId);
  }
}
