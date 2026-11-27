import type { OAuthToken } from '@toxictoast/shared-application';
import type { TwitchUser } from './twitch-user.interface.js';

export interface TwitchAuthorization {
  readonly user: TwitchUser;
  readonly token: OAuthToken;
}
