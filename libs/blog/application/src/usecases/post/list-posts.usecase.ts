import { Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import {
  PostStatus,
  type PostAnemic,
  type PostRepository,
} from '@toxictoast/blog-domain';
import type { Optional } from '@toxictoast/shared-types';
import type { ListPostsInput } from '../../data/index.js';

export class ListPostsUseCase implements UseCase<
  ListPostsInput,
  Array<PostAnemic>
> {
  constructor(private readonly repository: PostRepository) {}

  async execute(input: ListPostsInput): Promise<Result<Array<PostAnemic>>> {
    const posts = await this.repository.findByFilter(
      {
        status: this.statusOf(input),
        category_id: input.category_id ?? undefined,
        tag_id: input.tag_id ?? undefined,
      },
      input.limit,
      input.offset,
    );
    return Result.ok(posts);
  }

  private statusOf(input: ListPostsInput): Optional<PostStatus> {
    if (input.publishedOnly) {
      return PostStatus.PUBLISHED;
    }
    return input.status ?? undefined;
  }
}
