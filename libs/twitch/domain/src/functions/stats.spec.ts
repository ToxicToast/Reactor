import { ObservationKinds } from '../constants/index.js';
import type { TwitchObservation } from '../interfaces/index.js';
import { statsDayOf } from './stats-day-of.function.js';
import { statsEffectOf } from './stats-effect-of.function.js';
import { watchSeconds } from './watch-seconds.function.js';

const observation = (
  overrides: Partial<TwitchObservation>,
): TwitchObservation => {
  return {
    event_id: 'event-1',
    kind: ObservationKinds.MESSAGE,
    channel: {
      channel_id: '123456',
      channel_login: 'toxictoast',
      channel_name: 'ToxicToast',
    },
    occurred_at: new Date('2026-10-28T20:00:00Z'),
    user: null,
    amount: 0,
    gifted: false,
    reward: null,
    poll: null,
    stream_id: null,
    ...overrides,
  };
};

describe('statsEffectOf', () => {
  it.each([
    [
      { kind: ObservationKinds.MESSAGE },
      { messages: 1 },
      { messages: 1 },
      true,
    ],
    [{ kind: ObservationKinds.FOLLOW }, { follows: 1 }, {}, false],
    [{ kind: ObservationKinds.SUBSCRIPTION }, { subscriptions: 1 }, {}, false],
    [{ kind: ObservationKinds.SUBSCRIPTION, gifted: true }, {}, {}, false],
    [
      { kind: ObservationKinds.RESUBSCRIPTION },
      { resubscriptions: 1 },
      {},
      false,
    ],
    [
      { kind: ObservationKinds.GIFT, amount: 5 },
      { gifted_subs: 5 },
      { gifted_subs: 5 },
      false,
    ],
    [
      { kind: ObservationKinds.CHEER, amount: 100 },
      { bits: 100 },
      { bits: 100 },
      false,
    ],
    [
      { kind: ObservationKinds.RAID, amount: 42 },
      { raids: 1, raid_viewers: 42 },
      {},
      false,
    ],
    [
      { kind: ObservationKinds.REDEMPTION },
      { redemptions: 1 },
      { redemptions: 1 },
      false,
    ],
    [{ kind: ObservationKinds.JOIN }, {}, {}, false],
    [{ kind: ObservationKinds.POLL }, {}, {}, false],
  ] as const)(
    '%p counts %p for the channel and %p for the viewer',
    (input, counters, viewer, chatter) => {
      expect(statsEffectOf(observation(input))).toEqual({
        counters,
        viewer,
        counts_as_chatter: chatter,
      });
    },
  );
});

describe('watchSeconds', () => {
  const session = {
    started_at: new Date('2026-10-28T20:00:00Z'),
    ended_at: new Date('2026-10-28T22:00:00Z'),
  };

  it.each([
    [
      'inside the session',
      '2026-10-28T20:30:00Z',
      '2026-10-28T21:00:00Z',
      1800,
    ],
    [
      'joined before the start',
      '2026-10-28T19:00:00Z',
      '2026-10-28T20:10:00Z',
      600,
    ],
    ['left after the end', '2026-10-28T21:50:00Z', '2026-10-28T23:00:00Z', 600],
    ['outside the session', '2026-10-28T18:00:00Z', '2026-10-28T19:00:00Z', 0],
  ])('counts %s', (_, joined, left, expected) => {
    expect(watchSeconds(new Date(joined), new Date(left), session)).toBe(
      expected,
    );
  });

  it('counts up to the leave time while the session is live', () => {
    expect(
      watchSeconds(
        new Date('2026-10-28T20:00:00Z'),
        new Date('2026-10-28T20:05:00Z'),
        { started_at: session.started_at, ended_at: null },
      ),
    ).toBe(300);
  });

  it('counts nothing without a session', () => {
    expect(
      watchSeconds(
        new Date('2026-10-28T20:00:00Z'),
        new Date('2026-10-28T21:00:00Z'),
        null,
      ),
    ).toBe(0);
  });
});

describe('statsDayOf', () => {
  it('uses the calendar day of the time zone', () => {
    const lateEvening = new Date('2026-10-28T23:30:00Z');

    expect(statsDayOf(lateEvening, 'UTC')).toBe('2026-10-28');
    expect(statsDayOf(lateEvening, 'Europe/Berlin')).toBe('2026-10-29');
  });

  it('follows daylight saving time', () => {
    expect(statsDayOf(new Date('2026-07-01T22:30:00Z'), 'Europe/Berlin')).toBe(
      '2026-07-02',
    );
    expect(statsDayOf(new Date('2026-12-01T22:30:00Z'), 'Europe/Berlin')).toBe(
      '2026-12-01',
    );
  });
});
