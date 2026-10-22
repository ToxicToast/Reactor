import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import {
  CommentStatus,
  PostStatus,
  type CommentAnemic,
  type CommentRepository,
  type PostRepository,
} from '@toxictoast/blog-domain';
import type { PostCommentsInput } from '../../data/index.js';

export class ListPostCommentsUseCase implements UseCase<
  PostCommentsInput,
  Array<CommentAnemic>
> {
  constructor(
    private readonly repository: CommentRepository,
    private readonly posts: PostRepository,
  ) {}

  async execute(
    input: PostCommentsInput,
  ): Promise<Result<Array<CommentAnemic>>> {
    const post = await this.posts.findById(input.post_id);
    if (!post || post.status !== PostStatus.PUBLISHED) {
      return Result.fail(new NotFoundError('Post', input.post_id));
    }

    const comments = await this.repository.findByPostId(
      input.post_id,
      CommentStatus.APPROVED,
    );
    return Result.ok(comments);
  }
}
