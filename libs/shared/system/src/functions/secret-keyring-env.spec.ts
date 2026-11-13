import { randomBytes } from 'node:crypto';
import { secretKeyringEnv } from './secret-keyring-env.function.js';

describe('secretKeyringEnv', () => {
  const k1 = randomBytes(32);
  const k2 = randomBytes(32);

  it('reads all keys and the current key id', () => {
    const keyring = secretKeyringEnv('MY', {
      MY_KEYS: `k1:${k1.toString('base64')}, k2:${k2.toString('base64')}`,
      MY_KEY_ID: 'k2',
    });

    expect(keyring.currentKeyId).toBe('k2');
    expect(keyring.keys.get('k1')).toEqual(k1);
    expect(keyring.keys.get('k2')).toEqual(k2);
  });

  it('fails without keys', () => {
    expect(() => secretKeyringEnv('MY', { MY_KEY_ID: 'k1' })).toThrow(
      'MY_KEYS must list at least one key as id:base64',
    );
  });

  it('fails on entries without id', () => {
    expect(() =>
      secretKeyringEnv('MY', {
        MY_KEYS: k1.toString('base64'),
        MY_KEY_ID: 'k1',
      }),
    ).toThrow('MY_KEYS entries must look like id:base64');
  });

  it('fails on duplicate ids', () => {
    const entry = `k1:${k1.toString('base64')}`;

    expect(() =>
      secretKeyringEnv('MY', { MY_KEYS: `${entry},${entry}`, MY_KEY_ID: 'k1' }),
    ).toThrow('MY_KEYS lists key k1 twice');
  });

  it('fails without current key id', () => {
    expect(() =>
      secretKeyringEnv('MY', { MY_KEYS: `k1:${k1.toString('base64')}` }),
    ).toThrow();
  });
});
