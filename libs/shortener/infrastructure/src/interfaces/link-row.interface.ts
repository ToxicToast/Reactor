import type { AnemicRow } from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';

export interface LinkRow extends AnemicRow {
  target_url: string;
  description: Nullable<string>;
  active: boolean;
}
