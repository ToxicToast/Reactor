import { TimelineMetric as ProtoTimelineMetric } from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import {
  PEAK_CHATTERS_METRIC,
  type TimelineMetric,
} from '@toxictoast/twitch-domain';

export const TIMELINE_METRIC_MAP: Readonly<
  Record<ProtoTimelineMetric, Nullable<TimelineMetric>>
> = {
  [ProtoTimelineMetric.TIMELINE_METRIC_UNSPECIFIED]: null,
  [ProtoTimelineMetric.TIMELINE_METRIC_STREAM_SECONDS]: 'stream_seconds',
  [ProtoTimelineMetric.TIMELINE_METRIC_MESSAGES]: 'messages',
  [ProtoTimelineMetric.TIMELINE_METRIC_UNIQUE_CHATTERS]: 'unique_chatters',
  [ProtoTimelineMetric.TIMELINE_METRIC_PEAK_CHATTERS]: PEAK_CHATTERS_METRIC,
  [ProtoTimelineMetric.TIMELINE_METRIC_FOLLOWS]: 'follows',
  [ProtoTimelineMetric.TIMELINE_METRIC_SUBSCRIPTIONS]: 'subscriptions',
  [ProtoTimelineMetric.TIMELINE_METRIC_RESUBSCRIPTIONS]: 'resubscriptions',
  [ProtoTimelineMetric.TIMELINE_METRIC_GIFTED_SUBS]: 'gifted_subs',
  [ProtoTimelineMetric.TIMELINE_METRIC_BITS]: 'bits',
  [ProtoTimelineMetric.TIMELINE_METRIC_RAIDS]: 'raids',
  [ProtoTimelineMetric.TIMELINE_METRIC_REDEMPTIONS]: 'redemptions',
};
