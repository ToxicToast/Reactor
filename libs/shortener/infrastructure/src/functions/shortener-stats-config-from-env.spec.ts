import { shortenerStatsConfigFromEnv } from './shortener-stats-config-from-env.function.js';

describe('shortenerStatsConfigFromEnv', () => {
  it('defaults to Europe/Berlin', () => {
    expect(shortenerStatsConfigFromEnv({})).toEqual({
      time_zone: 'Europe/Berlin',
    });
  });

  it('reads the configured time zone', () => {
    expect(
      shortenerStatsConfigFromEnv({ SHORTENER_STATS_TIME_ZONE: 'UTC' }),
    ).toEqual({ time_zone: 'UTC' });
  });
});
