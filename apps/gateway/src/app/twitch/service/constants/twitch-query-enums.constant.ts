import {
  LeaderboardMetric,
  TimelineInterval,
  TimelineMetric,
} from '@toxictoast/contracts-grpc';

export const LEADERBOARD_METRIC_QUERY = {
  messages: LeaderboardMetric.LEADERBOARD_METRIC_MESSAGES,
  watch_time: LeaderboardMetric.LEADERBOARD_METRIC_WATCH_TIME,
  bits: LeaderboardMetric.LEADERBOARD_METRIC_BITS,
  gifted_subs: LeaderboardMetric.LEADERBOARD_METRIC_GIFTED_SUBS,
  redemptions: LeaderboardMetric.LEADERBOARD_METRIC_REDEMPTIONS,
} as const;

export const TIMELINE_METRIC_QUERY = {
  stream_seconds: TimelineMetric.TIMELINE_METRIC_STREAM_SECONDS,
  messages: TimelineMetric.TIMELINE_METRIC_MESSAGES,
  unique_chatters: TimelineMetric.TIMELINE_METRIC_UNIQUE_CHATTERS,
  peak_chatters: TimelineMetric.TIMELINE_METRIC_PEAK_CHATTERS,
  follows: TimelineMetric.TIMELINE_METRIC_FOLLOWS,
  subscriptions: TimelineMetric.TIMELINE_METRIC_SUBSCRIPTIONS,
  resubscriptions: TimelineMetric.TIMELINE_METRIC_RESUBSCRIPTIONS,
  gifted_subs: TimelineMetric.TIMELINE_METRIC_GIFTED_SUBS,
  bits: TimelineMetric.TIMELINE_METRIC_BITS,
  raids: TimelineMetric.TIMELINE_METRIC_RAIDS,
  redemptions: TimelineMetric.TIMELINE_METRIC_REDEMPTIONS,
} as const;

export const TIMELINE_INTERVAL_QUERY = {
  day: TimelineInterval.TIMELINE_INTERVAL_DAY,
  week: TimelineInterval.TIMELINE_INTERVAL_WEEK,
  month: TimelineInterval.TIMELINE_INTERVAL_MONTH,
} as const;
