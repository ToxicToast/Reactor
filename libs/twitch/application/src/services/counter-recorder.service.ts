import type { Nullable } from '@toxictoast/shared-types';
import {
  statsEffectOf,
  type ChannelStatsRepository,
  type ChatterActivityRepository,
  type RewardStatsRepository,
  type StreamSessionDomain,
  type TwitchObservation,
  type ViewerRef,
  type ViewerStatsRepository,
} from '@toxictoast/twitch-domain';
import { hasDeltas, statsDayFor } from '../functions/index.js';
import type { TwitchStatsConfig } from '../interfaces/index.js';

export class CounterRecorder {
  constructor(
    private readonly channelStats: ChannelStatsRepository,
    private readonly viewerStats: ViewerStatsRepository,
    private readonly chatters: ChatterActivityRepository,
    private readonly rewards: RewardStatsRepository,
    private readonly config: TwitchStatsConfig,
  ) {}

  async record(
    observation: TwitchObservation,
    session: Nullable<StreamSessionDomain>,
  ): Promise<void> {
    const channelId = observation.channel.channel_id;
    const effect = statsEffectOf(observation);
    const day = statsDayFor(
      observation.occurred_at,
      session?.toAnemic() ?? null,
      this.config.time_zone,
    );

    if (hasDeltas(effect.counters)) {
      await this.channelStats.increment(channelId, day, effect.counters);
      session?.record(effect.counters);
    }
    if (observation.reward) {
      await this.rewards.increment(channelId, observation.reward, day);
    }

    const user = observation.user;
    if (!user) {
      return;
    }
    await this.viewerStats.remember(channelId, user, observation.occurred_at);
    if (hasDeltas(effect.viewer)) {
      await this.viewerStats.increment(
        channelId,
        user.user_id,
        day,
        effect.viewer,
      );
    }
    if (effect.counts_as_chatter) {
      await this.countChatter(channelId, user, day, session);
    }
  }

  private async countChatter(
    channelId: string,
    user: ViewerRef,
    day: string,
    session: Nullable<StreamSessionDomain>,
  ): Promise<void> {
    if (await this.chatters.markDaily(channelId, day, user.user_id)) {
      await this.channelStats.increment(channelId, day, { unique_chatters: 1 });
    }
    if (
      session?.isLive &&
      (await this.chatters.markSession(session.toAnemic().id, user.user_id))
    ) {
      session.countUniqueChatter();
    }
  }
}
