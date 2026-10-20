import type { Nullable } from '@toxictoast/shared-types';

export interface AnemicRow {
  id: string;
  created_at: Date;
  updated_at: Nullable<Date>;
  deleted_at: Nullable<Date>;
}
