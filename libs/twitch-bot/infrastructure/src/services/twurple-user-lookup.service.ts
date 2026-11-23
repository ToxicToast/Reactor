import type {
  TwitchUser,
  TwitchUserLookup,
} from '@toxictoast/twitch-bot-application';
import type { Nullable } from '@toxictoast/shared-types';
import { userFromHelix } from '../functions/index.js';
import type { TwitchConnection } from './twitch-connection.service.js';

export class TwurpleUserLookup implements TwitchUserLookup {
  constructor(private readonly connection: TwitchConnection) {}

  async findByLogin(login: string): Promise<Nullable<TwitchUser>> {
    const api = await this.connection.appApi();
    const user = await api.users.getUserByName(login);
    if (!user) {
      return null;
    }
    return userFromHelix(user);
  }
}
