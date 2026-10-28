import type {
  LeaderboardEntry,
  StatsRange,
  ViewerRef,
} from '../interfaces/index.js';
import type { LeaderboardMetric, ViewerCounters } from '../types/index.js';

export interface ViewerStatsRepository {
  remember(channelId: string, viewer: ViewerRef, seenAt: Date): Promise<void>;
  increment(
    channelId: string,
    userId: string,
    day: string,
    deltas: Partial<ViewerCounters>,
  ): Promise<void>;
  leaderboard(
    channelId: string,
    metric: LeaderboardMetric,
    range: StatsRange,
    limit: number,
  ): Promise<Array<LeaderboardEntry>>;
}
