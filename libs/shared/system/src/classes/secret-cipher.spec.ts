import { randomBytes } from 'node:crypto';
import { SecretCipher } from './secret-cipher.js';

describe('SecretCipher', () => {
  const cipher = new SecretCipher(randomBytes(32));

  it('encrypts and decrypts a value', () => {
    const encrypted = cipher.encrypt('geheim');

    expect(encrypted.startsWith('v1.')).toBe(true);
    expect(encrypted).not.toContain('geheim');
    expect(cipher.decrypt(encrypted)).toBe('geheim');
  });

  it('uses a fresh iv for every value', () => {
    expect(cipher.encrypt('geheim')).not.toBe(cipher.encrypt('geheim'));
  });

  it('refuses tampered values', () => {
    const [version, iv, , data] = cipher.encrypt('geheim').split('.');
    const [, , foreignTag] = cipher.encrypt('anders').split('.');

    expect(() => {
      cipher.decrypt([version, iv, foreignTag, data].join('.'));
    }).toThrow();
  });

  it('refuses values encrypted with another key', () => {
    const other = new SecretCipher(randomBytes(32));

    expect(() => other.decrypt(cipher.encrypt('geheim'))).toThrow();
  });

  it('refuses unknown formats', () => {
    expect(() => cipher.decrypt('kaputt')).toThrow('Unsupported secret format');
  });

  it('refuses keys that are not 32 bytes long', () => {
    expect(() => new SecretCipher(randomBytes(16))).toThrow(
      'Secret key must be 32 bytes',
    );
  });
});
