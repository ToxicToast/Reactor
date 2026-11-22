import type {
  TwitchVideo,
  TwitchVideoSource,
} from '@toxictoast/twitch-bot-application';
import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';
import { videoFromHelix } from '../functions/index.js';
import type { TwitchConnection } from './twitch-connection.service.js';

export class TwurpleVideoSource implements TwitchVideoSource {
  constructor(private readonly connection: TwitchConnection) {}

  async listRecent(
    channel: TwitchChannelAnemic,
    limit: number,
  ): Promise<Array<TwitchVideo>> {
    const api = await this.connection.use(channel);
    const { data } = await api.videos.getVideosByUser(channel.twitch_id, {
      type: 'all',
      orderBy: 'time',
      limit,
    });
    return data.map(videoFromHelix);
  }

  async listAll(channel: TwitchChannelAnemic): Promise<Array<TwitchVideo>> {
    const api = await this.connection.use(channel);
    const videos = await api.videos
      .getVideosByUserPaginated(channel.twitch_id, {
        type: 'all',
        orderBy: 'time',
      })
      .getAll();
    return videos.map(videoFromHelix);
  }
}
