import type { Chainable, Nullable, Optional } from '@toxictoast/shared-types';
import type { Repository } from '@toxictoast/shared-kernel';
import type { PostAnemic } from '../anemics/index.js';
import type { PostFilter } from '../data/index.js';

interface AdditionalMethods {
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

export type PostRepository = Chainable<
  Repository<PostAnemic>,
  AdditionalMethods
>;
