import { twitchConfigFromEnv } from './twitch-config-from-env.function.js';

describe('twitchConfigFromEnv', () => {
  it('reads client id and secret', () => {
    expect(
      twitchConfigFromEnv({
        TWITCH_CLIENT_ID: 'client',
        TWITCH_CLIENT_SECRET: 'secret',
      }),
    ).toEqual({ clientId: 'client', clientSecret: 'secret' });
  });

  it('fails without client secret', () => {
    expect(() => twitchConfigFromEnv({ TWITCH_CLIENT_ID: 'client' })).toThrow();
  });
});
