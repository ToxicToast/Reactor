import type {
  Chatter,
  TwitchChannelAnemic,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import type { TwitchChatterSource } from '../interfaces/index.js';

export class FakeTwitchChatterSource implements TwitchChatterSource {
  readonly chatters = new Map<TwitchChannelId, Array<Chatter>>();

  async listChatters(channel: TwitchChannelAnemic): Promise<Array<Chatter>> {
    return [...(this.chatters.get(channel.id) ?? [])];
  }
}
