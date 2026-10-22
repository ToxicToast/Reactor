import { Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import type { CommentAnemic, CommentRepository } from '@toxictoast/blog-domain';
import type { ListCommentsByStatusInput } from '../../data/index.js';

export class ListCommentsByStatusUseCase implements UseCase<
  ListCommentsByStatusInput,
  Array<CommentAnemic>
> {
  constructor(private readonly repository: CommentRepository) {}

  async execute(
    input: ListCommentsByStatusInput,
  ): Promise<Result<Array<CommentAnemic>>> {
    const comments = await this.repository.findByStatus(
      input.status,
      input.limit,
      input.offset,
    );
    return Result.ok(comments);
  }
}
