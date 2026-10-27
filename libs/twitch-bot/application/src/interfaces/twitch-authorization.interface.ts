import type { TwitchToken } from './twitch-token.interface.js';
import type { TwitchUser } from './twitch-user.interface.js';

export interface TwitchAuthorization {
  readonly user: TwitchUser;
  readonly token: TwitchToken;
}
