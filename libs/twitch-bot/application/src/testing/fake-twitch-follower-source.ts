import type {
  Follower,
  TwitchChannelAnemic,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import type { TwitchFollowerSource } from '../interfaces/index.js';

export class FakeTwitchFollowerSource implements TwitchFollowerSource {
  readonly followers = new Map<TwitchChannelId, Array<Follower>>();

  async listFollowers(channel: TwitchChannelAnemic): Promise<Array<Follower>> {
    return [...(this.followers.get(channel.id) ?? [])];
  }
}
