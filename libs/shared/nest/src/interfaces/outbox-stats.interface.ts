import type { Nullable } from '@toxictoast/shared-types';

export interface OutboxStats {
  readonly count: string;
  readonly oldest_seconds: Nullable<string>;
}
