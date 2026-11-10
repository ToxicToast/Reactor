import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  ChannelDirectoryRepository,
  StreamSessionRepository,
} from '@toxictoast/twitch-domain';
import type { StatsChannel } from '../interfaces/index.js';

export class ListStatsChannelsUseCase implements UseCase<
  void,
  Array<StatsChannel>
> {
  constructor(
    private readonly directory: ChannelDirectoryRepository,
    private readonly sessions: StreamSessionRepository,
  ) {}

  async execute(): Promise<Result<Array<StatsChannel>>> {
    const channels = await this.directory.list();
    return Result.ok(
      await Promise.all(
        channels.map(async (channel) => {
          const live = await this.sessions.findLive(channel.channel_id);
          const latest = await this.sessions.findLatest(channel.channel_id);
          return {
            channel_id: channel.channel_id,
            channel_login: channel.channel_login,
            channel_name: channel.channel_name,
            live: live !== null,
            current_session_id: live?.id ?? null,
            last_session_at: latest?.started_at ?? null,
          };
        }),
      ),
    );
  }
}
