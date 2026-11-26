import type { Nullable } from '@toxictoast/shared-types';

/** Rohzeile aus dem Join von posts und post_checks */
export interface DuePostRow {
  readonly platform: string;
  readonly remote_id: string;
  readonly published_at: Date;
  readonly checked_at: Nullable<Date>;
}
