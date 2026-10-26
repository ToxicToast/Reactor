import type { AccessToken } from '@twurple/auth';
import type { TwitchToken } from '@toxictoast/twitch-bot-application';

export class TwitchAccessTokenMapper {
  toAccessToken(token: TwitchToken): AccessToken {
    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      scope: [...token.scopes],
      expiresIn: token.expires_in,
      obtainmentTimestamp: token.obtained_at.getTime(),
    };
  }

  toToken(token: AccessToken): TwitchToken {
    return {
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      scopes: [...token.scope],
      expires_in: token.expiresIn,
      obtained_at: new Date(token.obtainmentTimestamp),
    };
  }
}
