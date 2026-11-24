import type {
  Follower,
  TrackedChannel,
  TwitchChannelAnemic,
} from '@toxictoast/twitch-bot-domain';

export interface TwitchFollowerSource {
  listFollowers(channel: TwitchChannelAnemic): Promise<Array<Follower>>;
  /** Helix gibt die Gesamtzahl nur mit User-Token heraus, deshalb über einen eigenen Channel */
  countFollowers(
    channel: TrackedChannel,
    via: TwitchChannelAnemic,
  ): Promise<number>;
}
