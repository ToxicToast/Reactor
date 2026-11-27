import type { Nullable } from '@toxictoast/shared-types';
import type { OAuthToken, OAuthTokenStore } from '../interfaces/index.js';

export class InMemoryOAuthTokenStore<
  TOwnerId extends string = string,
> implements OAuthTokenStore<TOwnerId> {
  readonly items = new Map<TOwnerId, OAuthToken>();

  async save(ownerId: TOwnerId, token: OAuthToken): Promise<void> {
    this.items.set(ownerId, token);
  }

  async find(ownerId: TOwnerId): Promise<Nullable<OAuthToken>> {
    return this.items.get(ownerId) ?? null;
  }

  async remove(ownerId: TOwnerId): Promise<void> {
    this.items.delete(ownerId);
  }
}
