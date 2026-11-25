import { timeZoneEnv } from './time-zone-env.function.js';

describe('timeZoneEnv', () => {
  it('falls back when the variable is missing', () => {
    expect(timeZoneEnv('STATS_TIME_ZONE', 'Europe/Berlin', {})).toBe(
      'Europe/Berlin',
    );
  });

  it('reads the configured time zone', () => {
    expect(
      timeZoneEnv('STATS_TIME_ZONE', 'Europe/Berlin', {
        STATS_TIME_ZONE: 'UTC',
      }),
    ).toBe('UTC');
  });

  it('rejects unknown time zones', () => {
    expect(() => {
      return timeZoneEnv('STATS_TIME_ZONE', 'Europe/Berlin', {
        STATS_TIME_ZONE: 'Mars/Olympus',
      });
    }).toThrow('STATS_TIME_ZONE must be an IANA time zone, got Mars/Olympus');
  });
});
