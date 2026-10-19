import type {
  Chainable,
  Nullable,
  Optional,
  Repository,
} from '@toxictoast/shared-kernel';
import type { TagAnemic } from '../anemics/index.js';
import type { TagId } from '../types/index.js';

interface AdditionalMethods {
  findBySlug(
    slug: string,
    withDeleted?: Optional<boolean>,
  ): Promise<Nullable<TagAnemic>>;
  findByIds(ids: ReadonlyArray<TagId>): Promise<Array<TagAnemic>>;
}

export type TagRepository = Chainable<Repository<TagAnemic>, AdditionalMethods>;
