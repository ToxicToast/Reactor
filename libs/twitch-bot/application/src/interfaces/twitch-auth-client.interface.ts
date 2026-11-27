import type {
  OAuthAuthorizationUrl,
  OAuthCodeExchange,
} from '@toxictoast/shared-application';
import type { TwitchAuthorization } from './twitch-authorization.interface.js';

export interface TwitchAuthClient
  extends OAuthAuthorizationUrl, OAuthCodeExchange<TwitchAuthorization> {}
