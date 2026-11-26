import type { PostRef } from '@toxictoast/publisher-domain';
import type { Nullable } from '@toxictoast/shared-types';

export interface PostCheckRow extends PostRef {
  readonly checked_at: Date;
  readonly failures: number;
  readonly last_error: Nullable<string>;
}
