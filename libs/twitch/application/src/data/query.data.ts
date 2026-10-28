import type { Optional } from '@toxictoast/shared-types';
import type {
  LeaderboardMetric,
  StatsIntervalValue,
  TimelineMetric,
} from '@toxictoast/twitch-domain';

export interface ChannelQuery {
  readonly channel_id: string;
}

export interface RangeQuery extends ChannelQuery {
  readonly from?: Optional<Date>;
  readonly to?: Optional<Date>;
}

export interface PageQuery {
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
}

export interface ListSessionsInput extends RangeQuery, PageQuery {}

export interface ListPollsInput extends RangeQuery, PageQuery {}

export interface GetSessionInput {
  readonly id: string;
}

export interface GetLeaderboardInput extends RangeQuery {
  readonly metric: LeaderboardMetric;
  readonly limit?: Optional<number>;
}

export interface GetTimelineInput extends ChannelQuery {
  readonly metric: TimelineMetric;
  readonly interval: StatsIntervalValue;
  readonly from: Date;
  readonly to: Date;
}
