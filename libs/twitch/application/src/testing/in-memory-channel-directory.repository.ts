import type { Nullable } from '@toxictoast/shared-types';
import type {
  ChannelDirectoryRepository,
  ChannelRef,
  KnownChannel,
} from '@toxictoast/twitch-domain';

export class InMemoryChannelDirectoryRepository implements ChannelDirectoryRepository {
  private readonly channels = new Map<string, KnownChannel>();

  async remember(channel: ChannelRef, seenAt: Date): Promise<void> {
    this.channels.set(channel.channel_id, { ...channel, last_seen_at: seenAt });
  }

  async find(channelId: string): Promise<Nullable<KnownChannel>> {
    return this.channels.get(channelId) ?? null;
  }

  async list(): Promise<Array<KnownChannel>> {
    return [...this.channels.values()];
  }
}
