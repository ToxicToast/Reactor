import type { Repository } from '@toxictoast/shared-kernel';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { PostAnemic } from '../anemics/index.js';
import type { PostFilter } from '../data/index.js';

export interface PostRepository extends Repository<PostAnemic> {
  findBySlug(
    slug: string,
    withDeleted?: Optional<boolean>,
  ): Promise<Nullable<PostAnemic>>;
  findByFilter(
    filter: PostFilter,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<PostAnemic>>;
}
