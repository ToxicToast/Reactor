import type { OAuthAuthorizationUrl } from '@toxictoast/shared-application';
import type { TwitchAuthorization } from './twitch-authorization.interface.js';

export interface TwitchAuthClient extends OAuthAuthorizationUrl {
  exchangeCode(code: string, redirectUri: string): Promise<TwitchAuthorization>;
}
