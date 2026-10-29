import { LeaderboardMetric as ProtoLeaderboardMetric } from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import type { LeaderboardMetric } from '@toxictoast/twitch-domain';

export const LEADERBOARD_METRIC_MAP: Readonly<
  Record<ProtoLeaderboardMetric, Nullable<LeaderboardMetric>>
> = {
  [ProtoLeaderboardMetric.LEADERBOARD_METRIC_UNSPECIFIED]: null,
  [ProtoLeaderboardMetric.LEADERBOARD_METRIC_MESSAGES]: 'messages',
  [ProtoLeaderboardMetric.LEADERBOARD_METRIC_WATCH_TIME]: 'watch_seconds',
  [ProtoLeaderboardMetric.LEADERBOARD_METRIC_BITS]: 'bits',
  [ProtoLeaderboardMetric.LEADERBOARD_METRIC_GIFTED_SUBS]: 'gifted_subs',
  [ProtoLeaderboardMetric.LEADERBOARD_METRIC_REDEMPTIONS]: 'redemptions',
};
