import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchUser, TwitchUserLookup } from '../interfaces/index.js';

export class FakeTwitchUserLookup implements TwitchUserLookup {
  users: Array<TwitchUser> = [];

  async findByLogin(login: string): Promise<Nullable<TwitchUser>> {
    return this.users.find((user) => user.login === login) ?? null;
  }
}
