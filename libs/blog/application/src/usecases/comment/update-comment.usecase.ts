import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  CommentAnemic,
  CommentFactory,
  CommentRepository,
} from '@toxictoast/blog-domain';
import type { UpdateCommentInput } from '../../data/index.js';

export class UpdateCommentUseCase implements UseCase<
  UpdateCommentInput,
  CommentAnemic
> {
  constructor(
    private readonly factory: CommentFactory,
    private readonly repository: CommentRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: UpdateCommentInput): Promise<Result<CommentAnemic>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Comment', input.id));
    }

    const comment = this.factory.reconstitute(anemic);
    const updated = comment.updateContent(input.content);
    if (updated.isFailure) {
      return Result.fail(updated.error);
    }

    return this.persistence.persist(comment, this.repository);
  }
}
