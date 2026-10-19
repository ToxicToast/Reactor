import type { Nullable, Optional } from '@toxictoast/shared-kernel';
import type { CategoryId } from '@toxictoast/blog-domain';

export interface UpdateCategoryInput {
  readonly id: CategoryId;
  readonly title: string;
  readonly description: Nullable<string>;
}

export interface ChangeCategoryParentInput {
  readonly id: CategoryId;
  readonly parent_id: Nullable<CategoryId>;
}

export interface CategoryIdInput {
  readonly id: CategoryId;
  readonly withDeleted?: Optional<boolean>;
}

export interface ListCategoriesInput {
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
  readonly withDeleted?: Optional<boolean>;
}
