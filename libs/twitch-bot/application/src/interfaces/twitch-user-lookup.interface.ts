import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchUser } from './twitch-user.interface.js';

export interface TwitchUserLookup {
  findByLogin(login: string): Promise<Nullable<TwitchUser>>;
}
