import type { Nullable } from '@toxictoast/shared-types';
import type {
  ClosedDayRange,
  FollowerTotal,
  TimelinePoint,
} from '../interfaces/index.js';
import type {
  ChannelDayCounters,
  StatsIntervalValue,
  TimelineMetric,
} from '../types/index.js';

export interface ChannelStatsRepository {
  increment(
    channelId: string,
    day: string,
    deltas: Partial<ChannelDayCounters>,
  ): Promise<void>;
  raisePeak(channelId: string, day: string, chatters: number): Promise<void>;
  /** letzter Stand des Tages; überschreibt frühere Messungen desselben Tages */
  recordFollowerTotal(
    channelId: string,
    day: string,
    total: number,
  ): Promise<void>;
  latestFollowerTotal(channelId: string): Promise<Nullable<FollowerTotal>>;
  timeline(
    channelId: string,
    metric: TimelineMetric,
    interval: StatsIntervalValue,
    range: ClosedDayRange,
  ): Promise<Array<TimelinePoint>>;
}
