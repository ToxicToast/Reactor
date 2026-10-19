import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import {
  PostStatus,
  type PostAnemic,
  type PostRepository,
} from '@toxictoast/blog-domain';
import type { PostSlugInput } from '../data/index.js';

export class GetPublishedPostUseCase implements UseCase<
  PostSlugInput,
  PostAnemic
> {
  constructor(private readonly repository: PostRepository) {}

  async execute(input: PostSlugInput): Promise<Result<PostAnemic>> {
    const anemic = await this.repository.findBySlug(input.slug);
    if (!anemic || anemic.status !== PostStatus.PUBLISHED) {
      return Result.fail(new NotFoundError('Post', input.slug));
    }
    return Result.ok(anemic);
  }
}
