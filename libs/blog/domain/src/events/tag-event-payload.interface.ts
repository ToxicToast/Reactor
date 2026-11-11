import type { Nullable } from '@toxictoast/shared-types';
import type { TagId } from '../types/index.js';

export interface TagEventPayload {
  readonly id: TagId;
  readonly title: string;
  readonly slug: string;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
