import type {
  ChannelDirectoryRepository,
  PresenceRepository,
  StreamSessionRepository,
} from '@toxictoast/twitch-domain';
import type { LiveChannel } from '../interfaces/index.js';

export class LiveStatusReader {
  constructor(
    private readonly directory: ChannelDirectoryRepository,
    private readonly sessions: StreamSessionRepository,
    private readonly presence: PresenceRepository,
  ) {}

  async read(): Promise<Array<LiveChannel>> {
    const channels = await this.directory.list();
    return Promise.all(
      channels.map(async (channel) => {
        const live = await this.sessions.findLive(channel.channel_id);
        return {
          channel_id: channel.channel_id,
          channel_login: channel.channel_login,
          channel_name: channel.channel_name,
          live: live !== null,
          session_id: live?.id ?? null,
          started_at: live?.started_at ?? null,
          chatters: await this.presence.count(channel.channel_id),
        };
      }),
    );
  }
}
