import { ObservationKinds, StatsIntervals } from '@toxictoast/twitch-domain';
import {
  observation,
  TWITCH_TEST_CHANNEL,
  TwitchTestHarness,
  viewer,
} from '../testing/index.js';
import { GetLeaderboardUseCase } from './get-leaderboard.usecase.js';
import { GetSessionUseCase } from './get-session.usecase.js';
import { GetTimelineUseCase } from './get-timeline.usecase.js';
import { ListStatsChannelsUseCase } from './list-stats-channels.usecase.js';

const CHANNEL_ID = TWITCH_TEST_CHANNEL.channel_id;

describe('twitch stats queries', () => {
  let harness: TwitchTestHarness;

  const message = (userId: string, time: string) => {
    return harness.observe(
      observation({
        user: viewer(userId),
        occurred_at: new Date(`2026-10-${time}Z`),
      }),
    );
  };

  beforeEach(() => {
    harness = new TwitchTestHarness();
  });

  it('ranks viewers by a metric within a day range', async () => {
    await message('1', '27T20:00:00');
    await message('1', '28T20:00:00');
    await message('2', '28T20:00:00');
    await message('2', '28T20:01:00');

    const useCase = new GetLeaderboardUseCase(
      harness.viewerStats,
      harness.config,
    );
    const all = await useCase.execute({
      channel_id: CHANNEL_ID,
      metric: 'messages',
    });
    const today = await useCase.execute({
      channel_id: CHANNEL_ID,
      metric: 'messages',
      from: new Date('2026-10-28T00:00:00Z'),
    });

    expect(all.value.map((entry) => [entry.user_login, entry.value])).toEqual([
      ['user1', 2],
      ['user2', 2],
    ]);
    expect(today.value.map((entry) => [entry.user_login, entry.value])).toEqual(
      [
        ['user2', 2],
        ['user1', 1],
      ],
    );
  });

  it('builds a timeline and refuses inverted ranges', async () => {
    await message('1', '27T20:00:00');
    await message('1', '28T20:00:00');
    const useCase = new GetTimelineUseCase(
      harness.channelStats,
      harness.config,
    );

    const timeline = await useCase.execute({
      channel_id: CHANNEL_ID,
      metric: 'messages',
      interval: StatsIntervals.DAY,
      from: new Date('2026-10-27T00:00:00Z'),
      to: new Date('2026-10-28T23:59:59Z'),
    });
    const inverted = await useCase.execute({
      channel_id: CHANNEL_ID,
      metric: 'messages',
      interval: StatsIntervals.DAY,
      from: new Date('2026-10-28T00:00:00Z'),
      to: new Date('2026-10-27T00:00:00Z'),
    });

    expect(timeline.value).toEqual([
      { bucket_start: '2026-10-27', value: 1 },
      { bucket_start: '2026-10-28', value: 1 },
    ]);
    expect(inverted.error.code).toBe('VALIDATION');
  });

  it('lists the known channels with their live state', async () => {
    const online = observation({
      kind: ObservationKinds.STREAM_ONLINE,
      stream_id: 'stream-1',
    });
    await harness.observe(online, 'twitch.stream', 'online');

    const result = await new ListStatsChannelsUseCase(
      harness.directory,
      harness.sessions,
    ).execute();

    expect(result.value).toEqual([
      expect.objectContaining({
        channel_login: 'toxictoast',
        live: true,
        last_session_at: online.occurred_at,
      }),
    ]);
  });

  it('fails for an unknown session', async () => {
    const result = await new GetSessionUseCase(harness.sessions).execute({
      id: 'unknown',
    });

    expect(result.error.code).toBe('NOT_FOUND');
  });
});
