import type { Nullable } from '@toxictoast/shared-types';

export interface OAuthToken {
  readonly access_token: string;
  readonly refresh_token: Nullable<string>;
  readonly scopes: ReadonlyArray<string>;
  /** Sekunden ab obtained_at; null, wenn die Plattform keine Laufzeit nennt */
  readonly expires_in: Nullable<number>;
  readonly obtained_at: Date;
}
