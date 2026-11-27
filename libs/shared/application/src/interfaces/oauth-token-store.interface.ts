import type { Nullable } from '@toxictoast/shared-types';
import type { OAuthToken } from './oauth-token.interface.js';

/** ein Token je verbundenem Konto, verschlüsselt abgelegt */
export interface OAuthTokenStore<TOwnerId extends string = string> {
  save(ownerId: TOwnerId, token: OAuthToken): Promise<void>;
  find(ownerId: TOwnerId): Promise<Nullable<OAuthToken>>;
  remove(ownerId: TOwnerId): Promise<void>;
}
