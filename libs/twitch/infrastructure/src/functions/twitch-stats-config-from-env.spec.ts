import { twitchStatsConfigFromEnv } from './twitch-stats-config-from-env.function.js';

describe('twitchStatsConfigFromEnv', () => {
  it('defaults to Europe/Berlin', () => {
    expect(twitchStatsConfigFromEnv({})).toEqual({
      time_zone: 'Europe/Berlin',
    });
  });

  it('reads the configured time zone', () => {
    expect(twitchStatsConfigFromEnv({ TWITCH_STATS_TIME_ZONE: 'UTC' })).toEqual(
      { time_zone: 'UTC' },
    );
  });

  it('rejects unknown time zones', () => {
    expect(() => {
      return twitchStatsConfigFromEnv({
        TWITCH_STATS_TIME_ZONE: 'Mars/Olympus',
      });
    }).toThrow('TWITCH_STATS_TIME_ZONE must be an IANA time zone');
  });
});
