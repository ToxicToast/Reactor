import type { Nullable } from '@toxictoast/shared-types';
import type { AnemicRow } from '@toxictoast/shared-persistence';

export interface MediaRow extends AnemicRow {
  object_key: string;
  filename: string;
  mime_type: string;
  size: number;
  alt_text: Nullable<string>;
  status: string;
}
