import type { Repository } from '@toxictoast/shared-kernel';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { CategoryAnemic } from '../anemics/index.js';
import type { CategoryId } from '../types/index.js';

export interface CategoryRepository extends Repository<CategoryAnemic> {
  findBySlug(
    slug: string,
    withDeleted?: Optional<boolean>,
  ): Promise<Nullable<CategoryAnemic>>;
  findByIds(ids: ReadonlyArray<CategoryId>): Promise<Array<CategoryAnemic>>;
  findChildren(parentId: CategoryId): Promise<Array<CategoryAnemic>>;
}
