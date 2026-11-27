import type { OAuthAuthorization } from '@toxictoast/shared-application';
import type { TwitchUser } from './twitch-user.interface.js';

export interface TwitchAuthorization extends OAuthAuthorization {
  readonly user: TwitchUser;
}
