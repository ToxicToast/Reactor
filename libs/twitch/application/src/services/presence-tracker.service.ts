import {
  type ChannelStatsRepository,
  type PresenceRepository,
  type StreamSessionDomain,
  type TwitchObservation,
  type ViewerStatsRepository,
} from '@toxictoast/twitch-domain';
import type { Nullable } from '@toxictoast/shared-types';
import { statsDayFor } from '../functions/index.js';
import type { TwitchStatsConfig } from '../interfaces/index.js';
import type { SessionTracker } from './session-tracker.service.js';

export class PresenceTracker {
  constructor(
    private readonly presence: PresenceRepository,
    private readonly channelStats: ChannelStatsRepository,
    private readonly viewerStats: ViewerStatsRepository,
    private readonly sessions: SessionTracker,
    private readonly config: TwitchStatsConfig,
  ) {}

  async join(
    observation: TwitchObservation,
    session: Nullable<StreamSessionDomain>,
  ): Promise<void> {
    if (!observation.user) {
      return;
    }
    const channelId = observation.channel.channel_id;
    await this.presence.join(
      channelId,
      observation.user.user_id,
      observation.occurred_at,
    );
    await this.viewerStats.remember(
      channelId,
      observation.user,
      observation.occurred_at,
    );
    if (!session) {
      return;
    }

    const chatters = await this.presence.count(channelId);
    const anemic = session.toAnemic();
    session.observeChatters(chatters);
    await this.channelStats.raisePeak(
      channelId,
      statsDayFor(observation.occurred_at, anemic, this.config.time_zone),
      chatters,
    );
  }

  async leave(
    observation: TwitchObservation,
    session: Nullable<StreamSessionDomain>,
  ): Promise<void> {
    if (!observation.user) {
      return;
    }
    const joinedAt = await this.presence.leave(
      observation.channel.channel_id,
      observation.user.user_id,
    );
    if (!joinedAt || !session) {
      return;
    }

    const anemic = session.toAnemic();
    await this.sessions.creditViewer(
      anemic,
      observation.user.user_id,
      joinedAt,
      observation.occurred_at,
      statsDayFor(observation.occurred_at, anemic, this.config.time_zone),
    );
  }
}
