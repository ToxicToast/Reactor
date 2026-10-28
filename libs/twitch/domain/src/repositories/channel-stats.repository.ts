import type { StatsRange, TimelinePoint } from '../interfaces/index.js';
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
  timeline(
    channelId: string,
    metric: TimelineMetric,
    interval: StatsIntervalValue,
    range: Required<StatsRange>,
  ): Promise<Array<TimelinePoint>>;
}
