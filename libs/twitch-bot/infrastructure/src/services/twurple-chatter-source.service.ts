import type { TwitchChatterSource } from '@toxictoast/twitch-bot-application';
import type {
  Chatter,
  TwitchChannelAnemic,
} from '@toxictoast/twitch-bot-domain';
import { chatterFromHelix } from '../functions/index.js';
import type { TwitchConnection } from './twitch-connection.service.js';

export class TwurpleChatterSource implements TwitchChatterSource {
  constructor(private readonly connection: TwitchConnection) {}

  async listChatters(channel: TwitchChannelAnemic): Promise<Array<Chatter>> {
    const api = await this.connection.use(channel);
    const chatters = await api.asUser(channel.twitch_id, (ctx) => {
      return ctx.chat.getChattersPaginated(channel.twitch_id).getAll();
    });
    return chatters.map(chatterFromHelix);
  }
}
