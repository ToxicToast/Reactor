import type {
  Chatter,
  TwitchChannelAnemic,
} from '@toxictoast/twitch-bot-domain';

export interface TwitchChatterSource {
  listChatters(channel: TwitchChannelAnemic): Promise<Array<Chatter>>;
}
