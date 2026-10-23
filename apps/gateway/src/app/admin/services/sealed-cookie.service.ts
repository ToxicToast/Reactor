import type { Nullable, Optional } from '@toxictoast/shared-types';
import { EncryptJWT, jwtDecrypt } from 'jose';
import type { AdminAuthConfig } from '../interfaces/index.js';

export class SealedCookie {
  constructor(private readonly config: AdminAuthConfig) {}

  seal(data: object, ttlSeconds: number): Promise<string> {
    return new EncryptJWT({ data })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .setExpirationTime(`${ttlSeconds}s`)
      .encrypt(this.config.sessionSecret);
  }

  async open<T>(token: Optional<string>): Promise<Nullable<T>> {
    if (!token) {
      return null;
    }
    try {
      const { payload } = await jwtDecrypt(token, this.config.sessionSecret);
      return (payload['data'] as T) ?? null;
    } catch {
      return null;
    }
  }
}
