import {
  LeaderboardMetric,
  TimelineInterval,
  TimelineMetric,
  TwitchWebhookDeliveryStatus,
} from '@toxictoast/contracts-grpc';
import { LeaderboardQueryDto } from './leaderboard-query.dto.js';
import { TimelineQueryDto } from './timeline-query.dto.js';
import { EventsStreamQueryDto } from './events-stream-query.dto.js';
import { WebhookDeliveriesQueryDto } from './webhook-deliveries-query.dto.js';

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

  it('splits the topics of the event stream', () => {
    expect(
      EventsStreamQueryDto.schema.parse({
        topics: 'twitch.chat, twitch.stream,',
      }),
    ).toEqual({ topics: ['twitch.chat', 'twitch.stream'] });
    expect(EventsStreamQueryDto.schema.parse({})).toEqual({ topics: [] });
  });

  it('translates delivery statuses', () => {
    expect(
      WebhookDeliveriesQueryDto.schema.parse({ status: 'failed' }),
    ).toEqual({
      status: TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_FAILED,
    });
  });
});
