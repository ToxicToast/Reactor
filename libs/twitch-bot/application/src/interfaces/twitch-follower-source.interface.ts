import type {
  Follower,
  TwitchChannelAnemic,
} from '@toxictoast/twitch-bot-domain';

export interface TwitchFollowerSource {
  listFollowers(channel: TwitchChannelAnemic): Promise<Array<Follower>>;
}
