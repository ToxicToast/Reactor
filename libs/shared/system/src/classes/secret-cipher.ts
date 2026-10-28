import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { SECRET_CIPHER } from '../constants/index.js';

export class SecretCipher {
  constructor(private readonly key: Buffer) {
    if (key.length !== SECRET_CIPHER.KEY_BYTES) {
      throw new Error(`Secret key must be ${SECRET_CIPHER.KEY_BYTES} bytes`);
    }
  }

  encrypt(plain: string): string {
    const iv = randomBytes(SECRET_CIPHER.IV_BYTES);
    const cipher = createCipheriv(SECRET_CIPHER.ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]);
    return [
      SECRET_CIPHER.VERSION,
      iv.toString('base64url'),
      cipher.getAuthTag().toString('base64url'),
      encrypted.toString('base64url'),
    ].join('.');
  }

  decrypt(value: string): string {
    const [version, iv, tag, data] = value.split('.');
    if (
      version !== SECRET_CIPHER.VERSION ||
      iv === undefined ||
      tag === undefined ||
      data === undefined
    ) {
      throw new Error('Unsupported secret format');
    }

    const decipher = createDecipheriv(
      SECRET_CIPHER.ALGORITHM,
      this.key,
      Buffer.from(iv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(data, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }
}
