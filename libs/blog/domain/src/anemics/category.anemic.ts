import type { Anemic, Nullable } from '@toxictoast/shared-kernel';
import type { CategoryId } from '../types/index.js';

export interface CategoryAnemic extends Anemic<CategoryId> {
  readonly title: string;
  readonly slug: string;
  readonly description: Nullable<string>;
  readonly parent_id: Nullable<CategoryId>;
}
