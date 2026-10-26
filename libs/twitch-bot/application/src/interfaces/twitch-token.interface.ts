import type { Nullable } from '@toxictoast/shared-types';

export interface TwitchToken {
  readonly access_token: string;
  readonly refresh_token: Nullable<string>;
  readonly scopes: ReadonlyArray<string>;
  readonly expires_in: Nullable<number>;
  readonly obtained_at: Date;
}
