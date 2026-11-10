import type { DayRange, RewardRef, RewardStat } from '../interfaces/index.js';

export interface RewardStatsRepository {
  increment(channelId: string, reward: RewardRef, day: string): Promise<void>;
  list(channelId: string, range: DayRange): Promise<Array<RewardStat>>;
}
