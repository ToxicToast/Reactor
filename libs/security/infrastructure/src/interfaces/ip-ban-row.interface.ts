import type { AnemicRow } from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';

export interface IpBanRow extends AnemicRow {
  ip: string;
  level: number;
  failed_attempts: number;
  banned_until: Date;
  lifted_at: Nullable<Date>;
  lifted_by: Nullable<string>;
}
