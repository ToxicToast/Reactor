import { statsDayOf } from './stats-day-of.function.js';

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
