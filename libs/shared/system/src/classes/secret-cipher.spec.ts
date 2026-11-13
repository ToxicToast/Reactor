import { createCipheriv, randomBytes } from 'node:crypto';
import { SECRET_CIPHER } from '../constants/index.js';
import { SecretCipher } from './secret-cipher.js';

const legacyEncrypt = (key: Buffer, plain: string): string => {
  const iv = randomBytes(SECRET_CIPHER.IV_BYTES);
  const cipher = createCipheriv(SECRET_CIPHER.ALGORITHM, key, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [
    SECRET_CIPHER.LEGACY_VERSION,
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    data.toString('base64url'),
  ].join('.');
};

describe('SecretCipher', () => {
  const k1 = randomBytes(32);
  const k2 = randomBytes(32);
  const cipher = SecretCipher.withSingleKey(k1);

  it('encrypts with version and key id and decrypts again', () => {
    const encrypted = cipher.encrypt('geheim');

    expect(encrypted.startsWith('v2.k1.')).toBe(true);
    expect(encrypted).not.toContain('geheim');
    expect(cipher.decrypt(encrypted)).toBe('geheim');
  });

  it('uses a fresh iv for every value', () => {
    expect(cipher.encrypt('geheim')).not.toBe(cipher.encrypt('geheim'));
  });

  it('refuses tampered values', () => {
    const parts = cipher.encrypt('geheim').split('.');
    const foreign = cipher.encrypt('anders').split('.');
    parts[3] = foreign[3];

    expect(() => cipher.decrypt(parts.join('.'))).toThrow();
  });

  it('decrypts legacy v1 values with any configured key', () => {
    const rotated = new SecretCipher({
      currentKeyId: 'k2',
      keys: new Map([
        ['k1', k1],
        ['k2', k2],
      ]),
    });

    expect(rotated.decrypt(legacyEncrypt(k1, 'alt'))).toBe('alt');
  });

  it('keeps old keys readable after a rotation', () => {
    const rotated = new SecretCipher({
      currentKeyId: 'k2',
      keys: new Map([
        ['k1', k1],
        ['k2', k2],
      ]),
    });
    const old = cipher.encrypt('geheim');

    expect(rotated.decrypt(old)).toBe('geheim');
    expect(rotated.isCurrent(old)).toBe(false);
    expect(rotated.isCurrent(rotated.encrypt('geheim'))).toBe(true);
  });

  it('refuses values of an unknown key', () => {
    const other = SecretCipher.withSingleKey(randomBytes(32), 'k9');

    expect(() => cipher.decrypt(other.encrypt('geheim'))).toThrow(
      'Unknown secret key k9',
    );
  });

  it('tells plaintext from encrypted values', () => {
    expect(cipher.isEncrypted('https://discord.com/api/webhooks/1/abc')).toBe(
      false,
    );
    expect(cipher.isEncrypted(cipher.encrypt('x'))).toBe(true);
    expect(cipher.isEncrypted(legacyEncrypt(k1, 'x'))).toBe(true);
  });

  it('refuses unknown formats', () => {
    expect(() => cipher.decrypt('kaputt')).toThrow('Unsupported secret format');
  });

  it('refuses keys that are not 32 bytes long', () => {
    expect(() => SecretCipher.withSingleKey(randomBytes(16))).toThrow(
      'Secret key k1 must be 32 bytes',
    );
  });

  it('refuses a current key id without key', () => {
    expect(
      () =>
        new SecretCipher({ currentKeyId: 'k2', keys: new Map([['k1', k1]]) }),
    ).toThrow('Current secret key k2 is not configured');
  });
});
