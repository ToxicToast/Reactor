import { UnauthorizedException } from '@nestjs/common';
import type { KeycloakConfig } from '../../auth/interfaces/index.js';
import type { AdminAuthConfig } from '../interfaces/index.js';

export class KeycloakOidcClient {
  constructor(
    private readonly keycloak: KeycloakConfig,
    private readonly admin: AdminAuthConfig,
  ) {}

  authorizationUrl(state: string, challenge: string): string {
    const url = new URL(`${this.keycloak.issuer}/protocol/openid-connect/auth`);
    url.search = new URLSearchParams({
      client_id: this.admin.clientId,
      response_type: 'code',
      scope: 'openid',
      redirect_uri: this.admin.redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    }).toString();
    return url.toString();
  }

  logoutUrl(): string {
    const url = new URL(
      `${this.keycloak.issuer}/protocol/openid-connect/logout`,
    );
    url.search = new URLSearchParams({
      client_id: this.admin.clientId,
    }).toString();
    return url.toString();
  }

  async exchangeCode(code: string, verifier: string): Promise<string> {
    const response = await fetch(
      `${this.keycloak.issuer}/protocol/openid-connect/token`,
      {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.admin.redirectUri,
          client_id: this.admin.clientId,
          client_secret: this.admin.clientSecret,
          code_verifier: verifier,
        }),
      },
    );
    if (!response.ok) {
      throw new UnauthorizedException('login failed');
    }

    const body = (await response.json()) as { access_token?: unknown };
    if (typeof body.access_token !== 'string') {
      throw new UnauthorizedException('login failed');
    }
    return body.access_token;
  }
}
