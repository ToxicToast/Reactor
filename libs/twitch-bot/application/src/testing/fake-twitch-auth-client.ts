import type { Nullable } from '@toxictoast/shared-types';
import { TWITCH_BOT_SCOPES } from '../constants/index.js';
import type {
  TwitchAuthClient,
  TwitchAuthorization,
} from '../interfaces/index.js';
import { TEST_NOW } from './test-domain-context.js';

export class FakeTwitchAuthClient implements TwitchAuthClient {
  authorization: TwitchAuthorization = {
    user: {
      twitch_id: '123456',
      login: 'toxictoast',
      display_name: 'ToxicToast',
    },
    token: {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      scopes: [...TWITCH_BOT_SCOPES],
      expires_in: 14_400,
      obtained_at: TEST_NOW,
    },
  };

  rejectWith: Nullable<Error> = null;

  readonly exchanged: Array<{ code: string; redirect_uri: string }> = [];

  authorizationUrl(
    state: string,
    redirectUri: string,
    scopes: ReadonlyArray<string>,
  ): string {
    const params = new URLSearchParams({
      state,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
    });
    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCode(
    code: string,
    redirectUri: string,
  ): Promise<TwitchAuthorization> {
    this.exchanged.push({ code, redirect_uri: redirectUri });
    if (this.rejectWith) {
      throw this.rejectWith;
    }
    return this.authorization;
  }
}
