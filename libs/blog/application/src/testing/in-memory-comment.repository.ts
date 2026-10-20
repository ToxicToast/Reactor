import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  CommentAnemic,
  CommentId,
  CommentRepository,
  CommentStatus,
  PostId,
} from '@toxictoast/blog-domain';

export class InMemoryCommentRepository implements CommentRepository {
  readonly items = new Map<CommentId, CommentAnemic>();

  async save(anemic: CommentAnemic): Promise<CommentAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset = 0,
    withDeleted = false,
  ): Promise<Array<CommentAnemic>> {
    return this.page(
      [...this.items.values()].filter((comment) => {
        return withDeleted || comment.deleted_at === null;
      }),
      limit,
      offset,
    );
  }

  async findById(
    id: CommentId,
    withDeleted = false,
  ): Promise<Nullable<CommentAnemic>> {
    const comment = this.items.get(id) ?? null;
    if (comment && !withDeleted && comment.deleted_at !== null) {
      return null;
    }
    return comment;
  }

  async findByPostId(
    postId: PostId,
    status?: Optional<CommentStatus>,
  ): Promise<Array<CommentAnemic>> {
    return this.active().filter((comment) => {
      if (comment.post_id !== postId) {
        return false;
      }
      return status === undefined || comment.status === status;
    });
  }

  async findByStatus(
    status: CommentStatus,
    limit?: Optional<number>,
    offset = 0,
  ): Promise<Array<CommentAnemic>> {
    return this.page(
      this.active().filter((comment) => comment.status === status),
      limit,
      offset,
    );
  }

  private active(): Array<CommentAnemic> {
    return [...this.items.values()].filter((comment) => {
      return comment.deleted_at === null;
    });
  }

  private page(
    comments: Array<CommentAnemic>,
    limit: Optional<number>,
    offset: number,
  ): Array<CommentAnemic> {
    return comments.slice(
      offset,
      limit === undefined ? undefined : offset + limit,
    );
  }
}
