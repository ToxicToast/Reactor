import type { TwitchToken } from '@toxictoast/twitch-bot-application';
import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import type { TwitchTokenRow } from '../interfaces/index.js';
import type { TokenCipher } from '../services/token-cipher.service.js';

export class TwitchTokenMapper {
  constructor(private readonly cipher: TokenCipher) {}

  toToken(row: TwitchTokenRow): TwitchToken {
    return {
      access_token: this.cipher.decrypt(row.access_token),
      refresh_token:
        row.refresh_token === null
          ? null
          : this.cipher.decrypt(row.refresh_token),
      scopes: [...row.scopes],
      expires_in: row.expires_in,
      obtained_at: row.obtained_at,
    };
  }

  toRow(
    channelId: TwitchChannelId,
    token: TwitchToken,
    updatedAt: Date,
  ): TwitchTokenRow {
    return {
      channel_id: channelId,
      access_token: this.cipher.encrypt(token.access_token),
      refresh_token:
        token.refresh_token === null
          ? null
          : this.cipher.encrypt(token.refresh_token),
      scopes: [...token.scopes],
      expires_in: token.expires_in,
      obtained_at: token.obtained_at,
      updated_at: updatedAt,
    };
  }
}
