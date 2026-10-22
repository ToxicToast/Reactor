import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import {
  PostStatus,
  type PostAnemic,
  type PostRepository,
} from '@toxictoast/blog-domain';
import type { PostIdInput } from '../../data/index.js';

export class GetPostUseCase implements UseCase<PostIdInput, PostAnemic> {
  constructor(private readonly repository: PostRepository) {}

  async execute(input: PostIdInput): Promise<Result<PostAnemic>> {
    const anemic = await this.repository.findById(input.id, input.withDeleted);
    if (!anemic) {
      return Result.fail(new NotFoundError('Post', input.id));
    }
    if (input.publishedOnly && anemic.status !== PostStatus.PUBLISHED) {
      return Result.fail(new NotFoundError('Post', input.id));
    }
    return Result.ok(anemic);
  }
}
