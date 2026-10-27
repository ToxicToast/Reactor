import type { AccessToken } from '@twurple/auth';
import { ValidationError } from '@toxictoast/shared-kernel';
import type {
  TwitchAuthClient,
  TwitchAuthorization,
} from '@toxictoast/twitch-bot-application';
import { TWITCH_AUTHORIZE_URL } from '../constants/index.js';
import {
  createStaticAuthProvider,
  createTwitchApiClient,
} from '../factories/index.js';
import type { TwitchConfig } from '../interfaces/index.js';
import { TwitchAccessTokenMapper } from '../mappers/index.js';

export class TwurpleTwitchAuthClient implements TwitchAuthClient {
  private readonly mapper = new TwitchAccessTokenMapper();

  constructor(private readonly config: TwitchConfig) {}

  authorizationUrl(
    state: string,
    redirectUri: string,
    scopes: ReadonlyArray<string>,
  ): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      state,
      force_verify: 'true',
    });
    return `${TWITCH_AUTHORIZE_URL}?${params.toString()}`;
  }

  async exchangeCode(
    code: string,
    redirectUri: string,
  ): Promise<TwitchAuthorization> {
    const auth = await import('@twurple/auth');

    let token: AccessToken;
    try {
      token = await auth.exchangeCode(
        this.config.clientId,
        this.config.clientSecret,
        code,
        redirectUri,
      );
    } catch {
      throw new ValidationError('Twitch rejected the authorization code');
    }

    const info = await auth.getTokenInfo(
      token.accessToken,
      this.config.clientId,
    );
    if (info.userId === null || info.userName === null) {
      throw new ValidationError('Twitch returned a token without a user');
    }

    const api = await createTwitchApiClient(
      await createStaticAuthProvider(this.config.clientId, token),
    );
    const user = await api.users.getUserById(info.userId);

    return {
      user: {
        twitch_id: info.userId,
        login: info.userName,
        display_name: user?.displayName ?? info.userName,
      },
      token: this.mapper.toToken(token),
    };
  }
}
