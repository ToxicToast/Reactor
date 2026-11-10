import { randomBytes } from 'node:crypto';
import { secretKeyEnv } from './secret-key-env.function.js';

describe('secretKeyEnv', () => {
  it('decodes a 32 byte base64 key', () => {
    const key = randomBytes(32);

    expect(secretKeyEnv('MY_KEY', { MY_KEY: key.toString('base64') })).toEqual(
      key,
    );
  });

  it('refuses keys of the wrong length', () => {
    expect(() =>
      secretKeyEnv('MY_KEY', { MY_KEY: randomBytes(16).toString('base64') }),
    ).toThrow('MY_KEY must be 32 bytes encoded as base64');
  });

  it('fails without the variable', () => {
    expect(() => secretKeyEnv('MY_KEY', {})).toThrow();
  });
});
