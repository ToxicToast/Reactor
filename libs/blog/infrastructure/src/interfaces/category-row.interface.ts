import type { Nullable } from '@toxictoast/shared-types';
import type { AnemicRow } from '@toxictoast/shared-persistence';

export interface CategoryRow extends AnemicRow {
  title: string;
  slug: string;
  description: Nullable<string>;
  parent_id: Nullable<string>;
}
