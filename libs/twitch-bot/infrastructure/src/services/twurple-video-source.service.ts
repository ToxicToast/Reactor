import type {
  TwitchVideo,
  TwitchVideoSource,
} from '@toxictoast/twitch-bot-application';
import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import { videoFromHelix } from '../functions/index.js';
import type { TwitchConnection } from './twitch-connection.service.js';

export class TwurpleVideoSource implements TwitchVideoSource {
  constructor(private readonly connection: TwitchConnection) {}

  async listRecent(
    channel: TrackedChannel,
    limit: number,
  ): Promise<Array<TwitchVideo>> {
    const api = await this.connection.appApi();
    const { data } = await api.videos.getVideosByUser(channel.twitch_id, {
      type: 'all',
      orderBy: 'time',
      limit,
    });
    return data.map(videoFromHelix);
  }

  async listAll(channel: TrackedChannel): Promise<Array<TwitchVideo>> {
    const api = await this.connection.appApi();
    const videos = await api.videos
      .getVideosByUserPaginated(channel.twitch_id, {
        type: 'all',
        orderBy: 'time',
      })
      .getAll();
    return videos.map(videoFromHelix);
  }
}
