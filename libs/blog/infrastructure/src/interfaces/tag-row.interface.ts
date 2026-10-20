import type { AnemicRow } from '@toxictoast/shared-persistence';

export interface TagRow extends AnemicRow {
  title: string;
  slug: string;
}
