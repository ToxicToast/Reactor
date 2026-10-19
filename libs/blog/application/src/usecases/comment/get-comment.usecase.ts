import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import type { CommentAnemic, CommentRepository } from '@toxictoast/blog-domain';
import type { CommentIdInput } from '../../data/index.js';

export class GetCommentUseCase implements UseCase<
  CommentIdInput,
  CommentAnemic
> {
  constructor(private readonly repository: CommentRepository) {}

  async execute(input: CommentIdInput): Promise<Result<CommentAnemic>> {
    const anemic = await this.repository.findById(input.id, input.withDeleted);
    if (!anemic) {
      return Result.fail(new NotFoundError('Comment', input.id));
    }
    return Result.ok(anemic);
  }
}
