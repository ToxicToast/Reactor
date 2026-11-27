import type { Nullable } from '@toxictoast/shared-types';

export interface OAuthTokenRow {
  /** Spaltenname je Service, z. B. channel_id; siehe oauthTokenSchema */
  owner_id: string;
  access_token: string;
  refresh_token: Nullable<string>;
  scopes: Array<string>;
  expires_in: Nullable<number>;
  obtained_at: Date;
  updated_at: Date;
}
