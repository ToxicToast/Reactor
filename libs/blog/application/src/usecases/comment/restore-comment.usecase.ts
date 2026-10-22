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
import type { CommentIdInput } from '../../data/index.js';

export class RestoreCommentUseCase implements UseCase<
  CommentIdInput,
  CommentAnemic
> {
  constructor(
    private readonly factory: CommentFactory,
    private readonly repository: CommentRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: CommentIdInput): Promise<Result<CommentAnemic>> {
    const anemic = await this.repository.findById(input.id, true);
    if (!anemic) {
      return Result.fail(new NotFoundError('Comment', input.id));
    }

    const comment = this.factory.reconstitute(anemic);
    comment.restoreComment();

    return this.persistence.persist(comment, this.repository);
  }
}
