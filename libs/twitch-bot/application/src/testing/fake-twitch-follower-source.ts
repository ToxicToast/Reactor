import type {
  Follower,
  TrackedChannel,
  TwitchChannelAnemic,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import type { TwitchFollowerSource } from '../interfaces/index.js';

export class FakeTwitchFollowerSource implements TwitchFollowerSource {
  readonly followers = new Map<TwitchChannelId, Array<Follower>>();
  /** nach Twitch-ID, wie Helix */
  readonly totals = new Map<string, number>();

  async listFollowers(channel: TwitchChannelAnemic): Promise<Array<Follower>> {
    return [...(this.followers.get(channel.id) ?? [])];
  }

  async countFollowers(
    channel: TrackedChannel,
    _via: TwitchChannelAnemic,
  ): Promise<number> {
    return this.totals.get(channel.twitch_id) ?? 0;
  }
}
