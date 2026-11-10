import {
  CHANNEL_DAY_COUNTER_KEYS,
  SESSION_COUNTER_KEYS,
  VIEWER_COUNTER_KEYS,
} from '../constants/index.js';
import { addCounters } from './add-counters.function.js';
import { secondsBetween } from './seconds-between.function.js';
import { zeroCounters } from './zero-counters.function.js';

describe('zeroCounters', () => {
  it('creates a zero for every key', () => {
    expect(zeroCounters(VIEWER_COUNTER_KEYS)).toEqual({
      messages: 0,
      watch_seconds: 0,
      bits: 0,
      gifted_subs: 0,
      redemptions: 0,
    });
  });

  it('extends the session keys for channel days', () => {
    expect(Object.keys(zeroCounters(CHANNEL_DAY_COUNTER_KEYS))).toEqual([
      ...SESSION_COUNTER_KEYS,
      'stream_seconds',
      'unique_chatters',
    ]);
  });
});

describe('addCounters', () => {
  it('adds the deltas and keeps the other counters', () => {
    const base = { ...zeroCounters(SESSION_COUNTER_KEYS), messages: 2 };

    expect(
      addCounters(SESSION_COUNTER_KEYS, base, { messages: 1, bits: 100 }),
    ).toMatchObject({ messages: 3, bits: 100, follows: 0 });
  });

  it('only returns the given keys', () => {
    const base = { ...zeroCounters(VIEWER_COUNTER_KEYS), other: 'x' };

    expect(addCounters(VIEWER_COUNTER_KEYS, base, {})).not.toHaveProperty(
      'other',
    );
  });
});

describe('secondsBetween', () => {
  it.each([
    ['2026-10-28T20:00:00Z', '2026-10-28T20:01:30Z', 90],
    ['2026-10-28T20:00:00Z', '2026-10-28T20:00:00.999Z', 0],
    ['2026-10-28T20:01:00Z', '2026-10-28T20:00:00Z', 0],
  ])('from %p to %p is %p seconds', (from, to, expected) => {
    expect(secondsBetween(new Date(from), new Date(to))).toBe(expected);
  });
});
