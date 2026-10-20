import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import {
  CommentStatus,
  PostStatus,
  type CommentAnemic,
  type CommentData,
  type CommentFactory,
  type CommentRepository,
  type PostRepository,
} from '@toxictoast/blog-domain';
import { ModerationRequestService } from '../../services/index.js';

export class CreateCommentUseCase implements UseCase<
  CommentData,
  CommentAnemic
> {
  constructor(
    private readonly factory: CommentFactory,
    private readonly repository: CommentRepository,
    private readonly posts: PostRepository,
    private readonly moderation: ModerationRequestService,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(data: CommentData): Promise<Result<CommentAnemic>> {
    const post = await this.posts.findById(data.post_id);
    if (!post || post.status !== PostStatus.PUBLISHED) {
      return Result.fail(new NotFoundError('Post', data.post_id));
    }

    if (data.parent_id) {
      const parent = await this.repository.findById(data.parent_id);
      if (
        !parent ||
        parent.post_id !== data.post_id ||
        parent.status !== CommentStatus.APPROVED
      ) {
        return Result.fail(new NotFoundError('Comment', data.parent_id));
      }
    }

    const created = this.factory.createDomain(data);
    if (created.isFailure) {
      return Result.fail(created.error);
    }

    const comment = created.value;
    const request = this.moderation.forComment(comment.toAnemic());
    return this.persistence.persist(comment, this.repository, [request]);
  }
}
