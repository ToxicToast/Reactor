import type {
  Chainable,
  Nullable,
  Optional,
  Repository,
} from '@toxictoast/shared-kernel';
import type { PostAnemic } from '../anemics/index.js';
import type { PostStatus } from '../enums/index.js';
import type { CategoryId, TagId } from '../types/index.js';

interface AdditionalMethods {
  findBySlug(
    slug: string,
    withDeleted?: Optional<boolean>,
  ): Promise<Nullable<PostAnemic>>;
  findByStatus(
    status: PostStatus,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<PostAnemic>>;
  findByCategoryId(
    categoryId: CategoryId,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<PostAnemic>>;
  findByTagId(
    tagId: TagId,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<PostAnemic>>;
}

export type PostRepository = Chainable<
  Repository<PostAnemic>,
  AdditionalMethods
>;
