import type {
  CommentAnemic,
  CommentRepository,
  CommentStatus,
  PostId,
} from '@toxictoast/blog-domain';
import type { Optional } from '@toxictoast/shared-kernel';
import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { DataSource } from 'typeorm';
import type { CommentRow } from '../interfaces/index.js';
import { CommentMapper } from '../mappers/index.js';
import { CommentSchema } from '../schemas/index.js';

export class TypeOrmCommentRepository
  extends TypeOrmRepository<CommentAnemic, CommentRow>
  implements CommentRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, CommentSchema, new CommentMapper());
  }

  findByPostId(
    postId: PostId,
    status?: Optional<CommentStatus>,
  ): Promise<Array<CommentAnemic>> {
    const query = this.query()
      .andWhere('e.post_id = :postId', { postId })
      .orderBy('e.created_at', 'ASC');
    if (status) {
      query.andWhere('e.status = :status', { status });
    }
    return this.many(query);
  }

  findByStatus(
    status: CommentStatus,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<CommentAnemic>> {
    return this.many(
      this.query()
        .andWhere('e.status = :status', { status })
        .orderBy('e.created_at', 'ASC')
        .take(limit)
        .skip(offset),
    );
  }
}
