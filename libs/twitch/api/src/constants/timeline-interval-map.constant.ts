import { TimelineInterval } from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import {
  StatsIntervals,
  type StatsIntervalValue,
} from '@toxictoast/twitch-domain';

export const TIMELINE_INTERVAL_MAP: Readonly<
  Record<TimelineInterval, Nullable<StatsIntervalValue>>
> = {
  [TimelineInterval.TIMELINE_INTERVAL_UNSPECIFIED]: null,
  [TimelineInterval.TIMELINE_INTERVAL_DAY]: StatsIntervals.DAY,
  [TimelineInterval.TIMELINE_INTERVAL_WEEK]: StatsIntervals.WEEK,
  [TimelineInterval.TIMELINE_INTERVAL_MONTH]: StatsIntervals.MONTH,
};
