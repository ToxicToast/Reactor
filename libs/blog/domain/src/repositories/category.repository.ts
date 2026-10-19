import type {
  Chainable,
  Nullable,
  Optional,
  Repository,
} from '@toxictoast/shared-kernel';
import type { CategoryAnemic } from '../anemics/index.js';
import type { CategoryId } from '../types/index.js';

interface AdditionalMethods {
  findBySlug(
    slug: string,
    withDeleted?: Optional<boolean>,
  ): Promise<Nullable<CategoryAnemic>>;
  findByIds(ids: ReadonlyArray<CategoryId>): Promise<Array<CategoryAnemic>>;
  findChildren(parentId: CategoryId): Promise<Array<CategoryAnemic>>;
}

export type CategoryRepository = Chainable<
  Repository<CategoryAnemic>,
  AdditionalMethods
>;
