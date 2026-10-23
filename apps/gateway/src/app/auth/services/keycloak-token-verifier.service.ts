import { UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { KeycloakConfig } from '../interfaces/index.js';

export class KeycloakTokenVerifier {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly config: KeycloakConfig) {
    this.jwks = createRemoteJWKSet(
      new URL(`${config.issuer}/protocol/openid-connect/certs`),
    );
  }

  get audience(): string {
    return this.config.audience;
  }

  async verify(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.config.issuer,
        audience: this.config.audience,
      });
      return payload;
    } catch {
      throw new UnauthorizedException('invalid or expired token');
    }
  }
}
