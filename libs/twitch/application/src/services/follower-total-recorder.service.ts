import {
  statsDayOf,
  type ChannelDirectoryRepository,
  type ChannelStatsRepository,
} from '@toxictoast/twitch-domain';
import type {
  FollowerTotalChange,
  TwitchStatsConfig,
} from '../interfaces/index.js';

export class FollowerTotalRecorder {
  constructor(
    private readonly directory: ChannelDirectoryRepository,
    private readonly channelStats: ChannelStatsRepository,
    private readonly config: TwitchStatsConfig,
  ) {}

  /** merkt sich den Channel auch, wenn er noch nie gestreamt hat */
  async record(change: FollowerTotalChange): Promise<void> {
    await this.directory.remember(change.channel, change.observed_at);
    await this.channelStats.recordFollowerTotal(
      change.channel.channel_id,
      statsDayOf(change.observed_at, this.config.time_zone),
      change.total,
    );
  }
}
