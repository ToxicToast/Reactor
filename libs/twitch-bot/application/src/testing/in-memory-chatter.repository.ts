import type {
  Chatter,
  ChatterRepository,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';

export class InMemoryChatterRepository implements ChatterRepository {
  readonly items = new Map<TwitchChannelId, Array<Chatter>>();

  async findByChannel(channelId: TwitchChannelId): Promise<Array<Chatter>> {
    return [...(this.items.get(channelId) ?? [])];
  }

  async replace(
    channelId: TwitchChannelId,
    chatters: ReadonlyArray<Chatter>,
  ): Promise<void> {
    this.items.set(channelId, [...chatters]);
  }
}
