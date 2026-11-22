import type { Repository } from '@toxictoast/shared-kernel';
import type { Optional } from '@toxictoast/shared-types';
import type { CommentAnemic } from '../anemics/index.js';
import type { CommentStatus } from '../enums/index.js';
import type { PostId } from '../types/index.js';

export interface CommentRepository extends Repository<CommentAnemic> {
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
