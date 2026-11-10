import type { Nullable } from '@toxictoast/shared-types';
import type { CategoryId } from '../types/index.js';

export interface CategoryEventPayload {
  readonly id: CategoryId;
  readonly title: string;
  readonly slug: string;
  readonly description: Nullable<string>;
  readonly parent_id: Nullable<CategoryId>;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
