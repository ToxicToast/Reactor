import type {
  Follower,
  FollowerRepository,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';

export class InMemoryFollowerRepository implements FollowerRepository {
  readonly items = new Map<TwitchChannelId, Array<Follower>>();

  async findByChannel(channelId: TwitchChannelId): Promise<Array<Follower>> {
    return [...(this.items.get(channelId) ?? [])];
  }

  async replace(
    channelId: TwitchChannelId,
    followers: ReadonlyArray<Follower>,
  ): Promise<void> {
    this.items.set(channelId, [...followers]);
  }
}
