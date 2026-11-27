import type { OAuthToken } from '@toxictoast/shared-application';
import type { SecretCipher } from '@toxictoast/shared-system';
import type { OAuthTokenRow } from '../interfaces/index.js';

/** beide Tokens liegen nur verschlüsselt in der Datenbank */
export class OAuthTokenMapper {
  constructor(private readonly cipher: SecretCipher) {}

  toToken(row: OAuthTokenRow): OAuthToken {
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

  toRow(ownerId: string, token: OAuthToken, updatedAt: Date): OAuthTokenRow {
    return {
      owner_id: ownerId,
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
