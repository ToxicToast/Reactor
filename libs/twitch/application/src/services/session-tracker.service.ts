import type { DomainPersistence } from '@toxictoast/shared-application';
import type { Nullable } from '@toxictoast/shared-types';
import {
  watchSeconds,
  type ChannelStatsRepository,
  type PresenceRepository,
  type StreamSessionAnemic,
  type StreamSessionFactory,
  type StreamSessionRepository,
  type TwitchObservation,
  type ViewerStatsRepository,
} from '@toxictoast/twitch-domain';
import { expectSuccess, statsDayFor } from '../functions/index.js';
import type { TwitchStatsConfig } from '../interfaces/index.js';

export class SessionTracker {
  constructor(
    private readonly factory: StreamSessionFactory,
    private readonly sessions: StreamSessionRepository,
    private readonly presence: PresenceRepository,
    private readonly channelStats: ChannelStatsRepository,
    private readonly viewerStats: ViewerStatsRepository,
    private readonly persistence: DomainPersistence,
    private readonly config: TwitchStatsConfig,
  ) {}

  async online(observation: TwitchObservation): Promise<void> {
    const channelId = observation.channel.channel_id;
    const streamId = observation.stream_id ?? observation.event_id;
    const live = await this.sessions.findLive(channelId);
    if (live?.stream_id === streamId) {
      return;
    }
    if (live) {
      await this.close(live, observation.occurred_at);
    }

    const session = expectSuccess(
      this.factory.createDomain({
        channel: observation.channel,
        stream_id: streamId,
        started_at: observation.occurred_at,
      }),
    );
    expectSuccess(await this.persistence.persist(session, this.sessions));
    await this.presence.restartAll(channelId, observation.occurred_at);
  }

  async offline(observation: TwitchObservation): Promise<void> {
    const live = await this.sessions.findLive(observation.channel.channel_id);
    if (live) {
      await this.close(live, observation.occurred_at);
    }
  }

  private async close(
    anemic: StreamSessionAnemic,
    endedAt: Date,
  ): Promise<void> {
    const session = this.factory.reconstitute(anemic);
    expectSuccess(session.end(endedAt));
    const ended = session.toAnemic();
    const day = statsDayFor(endedAt, ended, this.config.time_zone);

    await this.creditWatchTime(ended, endedAt, day);
    await this.channelStats.increment(ended.channel_id, day, {
      stream_seconds: ended.duration_seconds ?? 0,
    });
    expectSuccess(await this.persistence.persist(session, this.sessions));
  }

  private async creditWatchTime(
    session: StreamSessionAnemic,
    endedAt: Date,
    day: string,
  ): Promise<void> {
    const present = await this.presence.restartAll(session.channel_id, endedAt);
    for (const entry of present) {
      await this.creditViewer(
        session,
        entry.user_id,
        entry.joined_at,
        endedAt,
        day,
      );
    }
  }

  async creditViewer(
    session: Nullable<StreamSessionAnemic>,
    userId: string,
    joinedAt: Date,
    leftAt: Date,
    day: string,
  ): Promise<void> {
    const seconds = watchSeconds(joinedAt, leftAt, session);
    if (seconds === 0 || !session) {
      return;
    }
    await this.viewerStats.increment(session.channel_id, userId, day, {
      watch_seconds: seconds,
    });
  }
}
