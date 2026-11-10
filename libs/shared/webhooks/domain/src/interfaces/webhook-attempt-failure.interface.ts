import type { Nullable } from '@toxictoast/shared-types';

export interface WebhookAttemptFailure {
  readonly status_code: Nullable<number>;
  readonly error: string;
}
