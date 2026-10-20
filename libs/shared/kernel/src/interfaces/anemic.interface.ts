import type { Nullable } from '@toxictoast/shared-types';
import type { Id } from '../types/index.js';

export interface Anemic<TId extends Id<string> = Id<string>> {
  readonly id: TId;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
