import { Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import type { PostAnemic, PostRepository } from '@toxictoast/blog-domain';
import type { ListPostsInput } from '../../data/index.js';

export class ListPostsUseCase implements UseCase<
  ListPostsInput,
  Array<PostAnemic>
> {
  constructor(private readonly repository: PostRepository) {}

  async execute(input: ListPostsInput): Promise<Result<Array<PostAnemic>>> {
    const posts = await this.load(input);
    if (input.status === undefined) {
      return Result.ok(posts);
    }
    return Result.ok(posts.filter((post) => post.status === input.status));
  }

  private load(input: ListPostsInput): Promise<Array<PostAnemic>> {
    if (input.category_id) {
      return this.repository.findByCategoryId(
        input.category_id,
        input.limit,
        input.offset,
      );
    }
    if (input.tag_id) {
      return this.repository.findByTagId(
        input.tag_id,
        input.limit,
        input.offset,
      );
    }
    if (input.status) {
      return this.repository.findByStatus(
        input.status,
        input.limit,
        input.offset,
      );
    }
    return this.repository.findList(input.limit, input.offset);
  }
}
