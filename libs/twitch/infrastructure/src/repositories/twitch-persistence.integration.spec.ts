import { TWITCH_TEST_CHANNEL } from '@toxictoast/twitch-application';
import type { Nullable } from '@toxictoast/shared-types';
import {
  SESSION_COUNTER_KEYS,
  StatsIntervals,
  zeroCounters,
  type PollSnapshot,
  type StreamSessionAnemic,
  type StreamSessionId,
} from '@toxictoast/twitch-domain';
import { TwitchTestDatabase } from '../testing/index.js';
import { TypeOrmChannelDirectoryRepository } from './typeorm-channel-directory.repository.js';
import { TypeOrmChannelStatsRepository } from './typeorm-channel-stats.repository.js';
import { TypeOrmChatterActivityRepository } from './typeorm-chatter-activity.repository.js';
import { TypeOrmPollRepository } from './typeorm-poll.repository.js';
import { TypeOrmPresenceRepository } from './typeorm-presence.repository.js';
import { TypeOrmRewardStatsRepository } from './typeorm-reward-stats.repository.js';
import { TypeOrmStreamSessionRepository } from './typeorm-stream-session.repository.js';
import { TypeOrmTwitchEventLog } from './typeorm-twitch-event-log.js';
import { TypeOrmViewerStatsRepository } from './typeorm-viewer-stats.repository.js';

const CHANNEL_ID = TWITCH_TEST_CHANNEL.channel_id;
const SESSION_A = '0192f3a0-0000-7000-8000-0000000005a1';
const SESSION_B = '0192f3a0-0000-7000-8000-0000000005a2';
const SESSION_C = '0192f3a0-0000-7000-8000-0000000005a3';
const OPEN = { from: null, to: null };

const at = (date: string, time = '20:00:00'): Date => {
  return new Date(`${date}T${time}Z`);
};

const session = (
  id: string,
  startedAt: Date,
  endedAt: Nullable<Date> = null,
): StreamSessionAnemic => {
  return {
    id: id as StreamSessionId,
    ...TWITCH_TEST_CHANNEL,
    stream_id: `stream-${id}`,
    started_at: startedAt,
    ended_at: endedAt,
    duration_seconds: null,
    ...zeroCounters(SESSION_COUNTER_KEYS),
    peak_chatters: 0,
    unique_chatters: 0,
    created_at: startedAt,
    updated_at: null,
    deleted_at: null,
  };
};

const viewer = (id: string) => {
  return { user_id: id, user_login: `user${id}`, user_name: `User${id}` };
};

const poll = (id: string, startedAt: Date, votes: number): PollSnapshot => {
  return {
    poll_id: id,
    title: 'Next game?',
    choices: [{ id: 'choice-1', title: 'Warcraft', votes }],
    status: 'ACTIVE',
    started_at: startedAt,
    ends_at: null,
    ended_at: null,
  };
};

describe('twitch persistence', () => {
  const database = new TwitchTestDatabase();
  let sessions: TypeOrmStreamSessionRepository;
  let channelStats: TypeOrmChannelStatsRepository;
  let viewerStats: TypeOrmViewerStatsRepository;
  let chatters: TypeOrmChatterActivityRepository;
  let presence: TypeOrmPresenceRepository;
  let rewards: TypeOrmRewardStatsRepository;
  let polls: TypeOrmPollRepository;
  let directory: TypeOrmChannelDirectoryRepository;
  let eventLog: TypeOrmTwitchEventLog;

  beforeAll(async () => {
    await database.start();
    const { dataSource, context } = database;
    sessions = new TypeOrmStreamSessionRepository(dataSource, context);
    channelStats = new TypeOrmChannelStatsRepository(dataSource, context);
    viewerStats = new TypeOrmViewerStatsRepository(dataSource, context);
    chatters = new TypeOrmChatterActivityRepository(dataSource, context);
    presence = new TypeOrmPresenceRepository(dataSource, context);
    rewards = new TypeOrmRewardStatsRepository(dataSource, context);
    polls = new TypeOrmPollRepository(dataSource, context);
    directory = new TypeOrmChannelDirectoryRepository(dataSource, context);
    eventLog = new TypeOrmTwitchEventLog(dataSource, context);
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  describe('stream sessions', () => {
    beforeEach(async () => {
      await sessions.save(
        session(SESSION_A, at('2026-10-26'), at('2026-10-26', '22:00:00')),
      );
      await sessions.save(session(SESSION_B, at('2026-10-28')));
    });

    it('finds the live, the latest and sessions within a range', async () => {
      expect((await sessions.findLive(CHANNEL_ID))?.id).toBe(SESSION_B);
      expect((await sessions.findLatest(CHANNEL_ID))?.id).toBe(SESSION_B);

      const range = { from: at('2026-10-25'), to: at('2026-10-27') };
      const found = await sessions.findByChannel(CHANNEL_ID, range);
      expect(found.map((entry) => entry.id)).toEqual([SESSION_A]);
    });

    it('allows only one live session per channel', async () => {
      await expect(
        sessions.save(session(SESSION_C, at('2026-10-28', '21:00:00'))),
      ).rejects.toThrow();
    });
  });

  describe('channel stats', () => {
    const value = async (metric: 'messages' | 'bits', day: string) => {
      const [point] = await channelStats.timeline(
        CHANNEL_ID,
        metric,
        StatsIntervals.DAY,
        { from: day, to: day },
      );
      return point?.value ?? 0;
    };

    it('increments counters atomically', async () => {
      await Promise.all(
        Array.from({ length: 10 }, () => {
          return channelStats.increment(CHANNEL_ID, '2026-10-28', {
            messages: 1,
            bits: 10,
          });
        }),
      );

      expect(await value('messages', '2026-10-28')).toBe(10);
      expect(await value('bits', '2026-10-28')).toBe(100);
    });

    it('groups the timeline by day, week and month', async () => {
      await channelStats.increment(CHANNEL_ID, '2026-10-26', { messages: 2 });
      await channelStats.increment(CHANNEL_ID, '2026-10-27', { messages: 3 });
      await channelStats.increment(CHANNEL_ID, '2026-11-02', { messages: 4 });
      const range = { from: '2026-10-01', to: '2026-11-30' };

      const days = await channelStats.timeline(
        CHANNEL_ID,
        'messages',
        StatsIntervals.DAY,
        range,
      );
      const weeks = await channelStats.timeline(
        CHANNEL_ID,
        'messages',
        StatsIntervals.WEEK,
        range,
      );
      const months = await channelStats.timeline(
        CHANNEL_ID,
        'messages',
        StatsIntervals.MONTH,
        range,
      );

      expect(days).toEqual([
        { bucket_start: '2026-10-26', value: 2 },
        { bucket_start: '2026-10-27', value: 3 },
        { bucket_start: '2026-11-02', value: 4 },
      ]);
      expect(weeks).toEqual([
        { bucket_start: '2026-10-26', value: 5 },
        { bucket_start: '2026-11-02', value: 4 },
      ]);
      expect(months).toEqual([
        { bucket_start: '2026-10-01', value: 5 },
        { bucket_start: '2026-11-01', value: 4 },
      ]);
    });

    it('keeps the highest chatter peak and takes the maximum per bucket', async () => {
      await channelStats.raisePeak(CHANNEL_ID, '2026-10-26', 5);
      await channelStats.raisePeak(CHANNEL_ID, '2026-10-26', 3);
      await channelStats.raisePeak(CHANNEL_ID, '2026-10-27', 7);

      const weeks = await channelStats.timeline(
        CHANNEL_ID,
        'peak_chatters',
        StatsIntervals.WEEK,
        { from: '2026-10-26', to: '2026-10-27' },
      );

      expect(weeks).toEqual([{ bucket_start: '2026-10-26', value: 7 }]);
    });
  });

  describe('viewer stats', () => {
    beforeEach(async () => {
      for (const id of ['1', '2', '3']) {
        await viewerStats.remember(CHANNEL_ID, viewer(id), at('2026-10-28'));
      }
      await viewerStats.increment(CHANNEL_ID, '1', '2026-10-27', {
        messages: 3,
      });
      await viewerStats.increment(CHANNEL_ID, '1', '2026-10-28', {
        messages: 2,
      });
      await viewerStats.increment(CHANNEL_ID, '2', '2026-10-28', {
        messages: 4,
      });
      await viewerStats.increment(CHANNEL_ID, '3', '2026-10-28', {
        watch_seconds: 600,
      });
    });

    it('ranks viewers within a day range and skips zero values', async () => {
      const all = await viewerStats.leaderboard(
        CHANNEL_ID,
        'messages',
        OPEN,
        10,
      );
      const today = await viewerStats.leaderboard(
        CHANNEL_ID,
        'messages',
        { from: '2026-10-28', to: null },
        10,
      );

      expect(all).toEqual([
        { ...viewer('1'), value: 5 },
        { ...viewer('2'), value: 4 },
      ]);
      expect(today.map((entry) => [entry.user_login, entry.value])).toEqual([
        ['user2', 4],
        ['user1', 2],
      ]);
    });

    it('limits the leaderboard and uses the latest name', async () => {
      await viewerStats.remember(
        CHANNEL_ID,
        { ...viewer('1'), user_name: 'RenamedOne' },
        at('2026-10-28', '21:00:00'),
      );

      const top = await viewerStats.leaderboard(
        CHANNEL_ID,
        'messages',
        OPEN,
        1,
      );

      expect(top).toEqual([
        { ...viewer('1'), user_name: 'RenamedOne', value: 5 },
      ]);
    });
  });

  describe('chatter activity', () => {
    it('marks a chatter only once per day and session', async () => {
      expect(await chatters.markDaily(CHANNEL_ID, '2026-10-28', '1')).toBe(
        true,
      );
      expect(await chatters.markDaily(CHANNEL_ID, '2026-10-28', '1')).toBe(
        false,
      );
      expect(await chatters.markDaily(CHANNEL_ID, '2026-10-29', '1')).toBe(
        true,
      );

      const sessionId = SESSION_A as StreamSessionId;
      expect(await chatters.markSession(sessionId, '1')).toBe(true);
      expect(await chatters.markSession(sessionId, '1')).toBe(false);
    });
  });

  describe('presence', () => {
    it('keeps the first join, restarts all and returns the join time on leave', async () => {
      await presence.join(CHANNEL_ID, '1', at('2026-10-28', '20:00:00'));
      await presence.join(CHANNEL_ID, '1', at('2026-10-28', '20:10:00'));
      await presence.join(CHANNEL_ID, '2', at('2026-10-28', '20:05:00'));

      expect(await presence.count(CHANNEL_ID)).toBe(2);
      expect(
        await presence.restartAll(CHANNEL_ID, at('2026-10-28', '21:00:00')),
      ).toEqual([
        { user_id: '1', joined_at: at('2026-10-28', '20:00:00') },
        { user_id: '2', joined_at: at('2026-10-28', '20:05:00') },
      ]);
      expect(await presence.leave(CHANNEL_ID, '1')).toEqual(
        at('2026-10-28', '21:00:00'),
      );
      expect(await presence.leave(CHANNEL_ID, '1')).toBeNull();
      expect(await presence.count(CHANNEL_ID)).toBe(1);
    });
  });

  describe('reward stats', () => {
    it('sums redemptions and spent points per reward', async () => {
      const hydrate = { reward_id: 'reward-1', title: 'Hydrate', cost: 500 };
      const stretch = { reward_id: 'reward-2', title: 'Stretch', cost: 100 };
      await rewards.increment(CHANNEL_ID, hydrate, '2026-10-27');
      await rewards.increment(CHANNEL_ID, hydrate, '2026-10-27');
      await rewards.increment(CHANNEL_ID, stretch, '2026-10-27');
      await rewards.increment(
        CHANNEL_ID,
        { ...hydrate, title: 'Drink water', cost: 600 },
        '2026-10-28',
      );

      expect(await rewards.list(CHANNEL_ID, OPEN)).toEqual([
        {
          reward_id: 'reward-1',
          title: 'Drink water',
          cost: 600,
          redemptions: 3,
          points_spent: 1600,
        },
        { ...stretch, redemptions: 1, points_spent: 100 },
      ]);
      expect(
        await rewards.list(CHANNEL_ID, { from: '2026-10-28', to: null }),
      ).toEqual([
        {
          reward_id: 'reward-1',
          title: 'Drink water',
          cost: 600,
          redemptions: 1,
          points_spent: 600,
        },
      ]);
    });
  });

  describe('polls', () => {
    it('keeps the latest state of a poll and filters by start', async () => {
      await polls.save(CHANNEL_ID, poll('poll-1', at('2026-10-28'), 3));
      await polls.save(CHANNEL_ID, {
        ...poll('poll-1', at('2026-10-28'), 9),
        status: 'COMPLETED',
      });
      await polls.save(CHANNEL_ID, poll('poll-2', at('2026-10-20'), 1));

      const recent = await polls.list(CHANNEL_ID, {
        from: at('2026-10-27'),
        to: null,
      });

      expect(recent).toEqual([
        {
          ...poll('poll-1', at('2026-10-28'), 9),
          status: 'COMPLETED',
          channel_id: CHANNEL_ID,
        },
      ]);
    });
  });

  describe('channel directory', () => {
    it('remembers channels with their latest name', async () => {
      await directory.remember(TWITCH_TEST_CHANNEL, at('2026-10-27'));
      await directory.remember(
        { ...TWITCH_TEST_CHANNEL, channel_name: 'TOXICTOAST' },
        at('2026-10-28'),
      );
      await directory.remember(
        {
          channel_id: '654321',
          channel_login: 'codemechanicus',
          channel_name: 'CodeMechanicus',
        },
        at('2026-10-28'),
      );

      expect(await directory.find(CHANNEL_ID)).toEqual({
        ...TWITCH_TEST_CHANNEL,
        channel_name: 'TOXICTOAST',
        last_seen_at: at('2026-10-28'),
      });
      expect(
        (await directory.list()).map((channel) => channel.channel_login),
      ).toEqual(['codemechanicus', 'toxictoast']);
    });
  });

  describe('event log', () => {
    it('records an event only once', async () => {
      const event = {
        event_id: 'event-1',
        topic: 'twitch.chat',
        name: 'message',
        channel_id: CHANNEL_ID,
        occurred_at: at('2026-10-28'),
        payload: { text: 'hi' },
      };

      expect(await eventLog.record(event)).toBe(true);
      expect(await eventLog.record(event)).toBe(false);
    });
  });
});
