import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  TwitchChannelAnemic,
  TwitchChannelId,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';

export class InMemoryTwitchChannelRepository implements TwitchChannelRepository {
  readonly items = new Map<TwitchChannelId, TwitchChannelAnemic>();

  async save(anemic: TwitchChannelAnemic): Promise<TwitchChannelAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset = 0,
    withDeleted = false,
  ): Promise<Array<TwitchChannelAnemic>> {
    const channels = [...this.items.values()].filter((channel) => {
      return withDeleted || channel.deleted_at === null;
    });
    return channels.slice(
      offset,
      limit === undefined ? undefined : offset + limit,
    );
  }

  async findById(id: TwitchChannelId): Promise<Nullable<TwitchChannelAnemic>> {
    return this.items.get(id) ?? null;
  }

  async findByTwitchId(
    twitchId: string,
  ): Promise<Nullable<TwitchChannelAnemic>> {
    return (
      [...this.items.values()].find((channel) => {
        return channel.twitch_id === twitchId;
      }) ?? null
    );
  }

  async findConnected(): Promise<Array<TwitchChannelAnemic>> {
    return [...this.items.values()].filter((channel) => {
      return channel.connected && channel.deleted_at === null;
    });
  }
}
