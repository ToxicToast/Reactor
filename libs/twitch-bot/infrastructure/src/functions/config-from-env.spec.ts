import { randomBytes } from 'node:crypto';
import { tokenCipherKeyFromEnv } from './token-cipher-key-from-env.function.js';
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

describe('tokenCipherKeyFromEnv', () => {
  it('decodes a 32 byte base64 key', () => {
    const key = randomBytes(32);

    expect(
      tokenCipherKeyFromEnv({ TWITCH_TOKEN_KEY: key.toString('base64') }),
    ).toEqual(key);
  });

  it('refuses keys of the wrong length', () => {
    expect(() =>
      tokenCipherKeyFromEnv({
        TWITCH_TOKEN_KEY: randomBytes(16).toString('base64'),
      }),
    ).toThrow('TWITCH_TOKEN_KEY must be 32 bytes encoded as base64');
  });
});
