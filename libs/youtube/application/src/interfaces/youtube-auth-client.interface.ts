import type {
  OAuthAuthorizationUrl,
  OAuthCodeExchange,
} from '@toxictoast/shared-application';
import type { YouTubeAuthorization } from './youtube-authorization.interface.js';

export interface YouTubeAuthClient
  extends OAuthAuthorizationUrl, OAuthCodeExchange<YouTubeAuthorization> {}
