import { TIME_MS } from '@toxictoast/shared-types';
import { isMetricsDue } from './is-metrics-due.function.js';
import { metricsIntervalOf } from './metrics-interval-of.function.js';

const NOW = new Date('2026-11-25T12:00:00Z');
const ago = (ms: number): Date => new Date(NOW.getTime() - ms);

describe('metricsIntervalOf', () => {
  it.each([
    [TIME_MS.HOUR, 15 * TIME_MS.MINUTE],
    [12 * TIME_MS.HOUR, TIME_MS.HOUR],
    [3 * TIME_MS.DAY, 6 * TIME_MS.HOUR],
    [14 * TIME_MS.DAY, TIME_MS.DAY],
    [90 * TIME_MS.DAY, 7 * TIME_MS.DAY],
    [400 * TIME_MS.DAY, 30 * TIME_MS.DAY],
  ])('a post published %d ms ago is checked every %d ms', (age, interval) => {
    expect(metricsIntervalOf(ago(age), NOW)).toBe(interval);
  });
});

describe('isMetricsDue', () => {
  it('is due when it was never checked', () => {
    expect(isMetricsDue(ago(TIME_MS.DAY * 400), null, NOW)).toBe(true);
  });

  it('waits for the interval of the age tier', () => {
    const publishedAt = ago(TIME_MS.HOUR);

    expect(isMetricsDue(publishedAt, ago(10 * TIME_MS.MINUTE), NOW)).toBe(
      false,
    );
    expect(isMetricsDue(publishedAt, ago(15 * TIME_MS.MINUTE), NOW)).toBe(true);
  });
});
