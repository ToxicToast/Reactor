import type { Follower } from '../interfaces/index.js';
import type { TwitchChannelId } from '../types/index.js';

export interface FollowerRepository {
  findByChannel(channelId: TwitchChannelId): Promise<Array<Follower>>;
  replace(
    channelId: TwitchChannelId,
    followers: ReadonlyArray<Follower>,
  ): Promise<void>;
}
