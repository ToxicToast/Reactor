import type { Nullable } from '@toxictoast/shared-types';

export interface TwitchCredentialsStatus {
  readonly valid: boolean;
  readonly message: Nullable<string>;
  readonly checked_at: Date;
}
