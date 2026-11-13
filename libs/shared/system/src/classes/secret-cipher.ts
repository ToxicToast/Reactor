import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { Nullable } from '@toxictoast/shared-types';
import { SECRET_CIPHER } from '../constants/index.js';
import type { ParsedSecret, SecretKeyring } from '../interfaces/index.js';

export class SecretCipher {
  private readonly currentKey: Buffer;

  constructor(private readonly keyring: SecretKeyring) {
    for (const [id, key] of keyring.keys) {
      if (key.length !== SECRET_CIPHER.KEY_BYTES) {
        throw new Error(
          `Secret key ${id} must be ${SECRET_CIPHER.KEY_BYTES} bytes`,
        );
      }
    }

    const current = keyring.keys.get(keyring.currentKeyId);
    if (!current) {
      throw new Error(
        `Current secret key ${keyring.currentKeyId} is not configured`,
      );
    }
    this.currentKey = current;
  }

  static withSingleKey(
    key: Buffer,
    keyId: string = SECRET_CIPHER.DEFAULT_KEY_ID,
  ): SecretCipher {
    return new SecretCipher({
      currentKeyId: keyId,
      keys: new Map([[keyId, key]]),
    });
  }

  encrypt(plain: string): string {
    const iv = randomBytes(SECRET_CIPHER.IV_BYTES);
    const cipher = createCipheriv(SECRET_CIPHER.ALGORITHM, this.currentKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]);
    return [
      SECRET_CIPHER.VERSION,
      this.keyring.currentKeyId,
      iv.toString('base64url'),
      cipher.getAuthTag().toString('base64url'),
      encrypted.toString('base64url'),
    ].join(SECRET_CIPHER.SEPARATOR);
  }

  decrypt(value: string): string {
    const parsed = this.parse(value);
    if (!parsed) {
      throw new Error('Unsupported secret format');
    }
    if (parsed.keyId === null) {
      return this.openWithAnyKey(parsed);
    }

    const key = this.keyring.keys.get(parsed.keyId);
    if (!key) {
      throw new Error(`Unknown secret key ${parsed.keyId}`);
    }
    return this.open(key, parsed);
  }

  isEncrypted(value: string): boolean {
    return this.parse(value) !== null;
  }

  /** true, wenn der Wert im aktuellen Format mit dem aktuellen Schlüssel vorliegt */
  isCurrent(value: string): boolean {
    return this.parse(value)?.keyId === this.keyring.currentKeyId;
  }

  private parse(value: string): Nullable<ParsedSecret> {
    const parts = value.split(SECRET_CIPHER.SEPARATOR);
    if (
      parts[0] === SECRET_CIPHER.VERSION &&
      parts.length === SECRET_CIPHER.PARTS
    ) {
      const [, keyId, iv, tag, data] = parts;
      return { keyId, iv, tag, data };
    }
    if (
      parts[0] === SECRET_CIPHER.LEGACY_VERSION &&
      parts.length === SECRET_CIPHER.LEGACY_PARTS
    ) {
      const [, iv, tag, data] = parts;
      return { keyId: null, iv, tag, data };
    }
    return null;
  }

  private open(key: Buffer, secret: ParsedSecret): string {
    const decipher = createDecipheriv(
      SECRET_CIPHER.ALGORITHM,
      key,
      Buffer.from(secret.iv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(secret.tag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(secret.data, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  /** v1-Werte tragen keine Key-ID: GCM erkennt den richtigen Schlüssel am Auth-Tag */
  private openWithAnyKey(secret: ParsedSecret): string {
    for (const key of this.keyring.keys.values()) {
      try {
        return this.open(key, secret);
      } catch {
        continue;
      }
    }
    throw new Error('No configured secret key decrypts the value');
  }
}
