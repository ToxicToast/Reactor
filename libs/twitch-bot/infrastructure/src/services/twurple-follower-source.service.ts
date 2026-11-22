import type { TwitchFollowerSource } from '@toxictoast/twitch-bot-application';
import type {
  Follower,
  TwitchChannelAnemic,
} from '@toxictoast/twitch-bot-domain';
import { followerFromHelix } from '../functions/index.js';
import type { TwitchConnection } from './twitch-connection.service.js';

export class TwurpleFollowerSource implements TwitchFollowerSource {
  constructor(private readonly connection: TwitchConnection) {}

  async listFollowers(channel: TwitchChannelAnemic): Promise<Array<Follower>> {
    const api = await this.connection.use(channel);
    const followers = await api.asUser(channel.twitch_id, (ctx) => {
      return ctx.channels
        .getChannelFollowersPaginated(channel.twitch_id)
        .getAll();
    });
    return followers.map(followerFromHelix);
  }
}
