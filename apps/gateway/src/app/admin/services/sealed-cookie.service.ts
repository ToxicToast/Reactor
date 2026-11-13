import type { Nullable, Optional } from '@toxictoast/shared-types';
import { parse } from 'cookie';
import type { CookieOptions, Request, Response } from 'express';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { SEALED_COOKIE } from '../constants/index.js';
import type { AdminAuthConfig } from '../interfaces/index.js';

export class SealedCookie {
  constructor(private readonly config: AdminAuthConfig) {}

  async write(
    response: Response,
    name: string,
    data: object,
    path: string,
    ttlSeconds: number,
  ): Promise<void> {
    response.cookie(
      name,
      await this.seal(data, ttlSeconds),
      this.options(path, ttlSeconds),
    );
  }

  read<T>(request: Request, name: string): Promise<Nullable<T>> {
    return this.open<T>(parse(request.headers.cookie ?? '')[name]);
  }

  clear(response: Response, name: string, path: string): void {
    response.clearCookie(name, { path });
  }

  seal(data: object, ttlSeconds: number): Promise<string> {
    return new EncryptJWT({ data })
      .setProtectedHeader({
        alg: SEALED_COOKIE.ALGORITHM,
        enc: SEALED_COOKIE.ENCRYPTION,
      })
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

  private options(path: string, ttlSeconds: number): CookieOptions {
    return {
      httpOnly: true,
      sameSite: SEALED_COOKIE.SAME_SITE,
      secure: this.config.secureCookies,
      path,
      maxAge: ttlSeconds * SEALED_COOKIE.MS_PER_SECOND,
    };
  }
}
