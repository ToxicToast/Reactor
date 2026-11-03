import {
  LeaderboardMetric,
  TimelineInterval,
  TimelineMetric,
} from '@toxictoast/contracts-grpc';
import { LeaderboardQueryDto } from './leaderboard-query.dto.js';
import { TimelineQueryDto } from './timeline-query.dto.js';

describe('twitch query dtos', () => {
  it('translates readable metrics into proto enums', () => {
    expect(
      LeaderboardQueryDto.schema.parse({ metric: 'watch_time', limit: '5' }),
    ).toEqual({
      metric: LeaderboardMetric.LEADERBOARD_METRIC_WATCH_TIME,
      limit: 5,
    });
  });

  it('rejects unknown metrics', () => {
    expect(
      LeaderboardQueryDto.schema.safeParse({ metric: 'followers' }).success,
    ).toBe(false);
  });

  it('requires a full range for timelines', () => {
    expect(
      TimelineQueryDto.schema.parse({
        metric: 'peak_chatters',
        interval: 'week',
        from: '2026-10-01T00:00:00Z',
        to: '2026-10-31T23:59:59Z',
      }),
    ).toEqual({
      metric: TimelineMetric.TIMELINE_METRIC_PEAK_CHATTERS,
      interval: TimelineInterval.TIMELINE_INTERVAL_WEEK,
      from: '2026-10-01T00:00:00Z',
      to: '2026-10-31T23:59:59Z',
    });
    expect(
      TimelineQueryDto.schema.safeParse({ metric: 'messages', interval: 'day' })
        .success,
    ).toBe(false);
  });
});
