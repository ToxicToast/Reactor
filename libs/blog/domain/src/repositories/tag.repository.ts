import type { Repository } from '@toxictoast/shared-kernel';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { TagAnemic } from '../anemics/index.js';
import type { TagId } from '../types/index.js';

export interface TagRepository extends Repository<TagAnemic> {
  findBySlug(
    slug: string,
    withDeleted?: Optional<boolean>,
  ): Promise<Nullable<TagAnemic>>;
  findByIds(ids: ReadonlyArray<TagId>): Promise<Array<TagAnemic>>;
}
