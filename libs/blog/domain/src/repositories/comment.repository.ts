import type { Chainable, Optional } from '@toxictoast/shared-types';
import type { Repository } from '@toxictoast/shared-kernel';
import type { CommentAnemic } from '../anemics/index.js';
import type { CommentStatus } from '../enums/index.js';
import type { PostId } from '../types/index.js';

interface AdditionalMethods {
  findByPostId(
    postId: PostId,
    status?: Optional<CommentStatus>,
  ): Promise<Array<CommentAnemic>>;
  findByStatus(
    status: CommentStatus,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<CommentAnemic>>;
}

export type CommentRepository = Chainable<
  Repository<CommentAnemic>,
  AdditionalMethods
>;
