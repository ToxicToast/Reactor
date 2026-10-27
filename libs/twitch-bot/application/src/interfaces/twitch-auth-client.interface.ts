import type { TwitchAuthorization } from './twitch-authorization.interface.js';

export interface TwitchAuthClient {
  authorizationUrl(
    state: string,
    redirectUri: string,
    scopes: ReadonlyArray<string>,
  ): string;
  exchangeCode(code: string, redirectUri: string): Promise<TwitchAuthorization>;
}
