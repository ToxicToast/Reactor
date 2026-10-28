import type { Nullable } from '@toxictoast/shared-types';

export interface StatsRange {
  readonly from: Nullable<Date>;
  readonly to: Nullable<Date>;
}
