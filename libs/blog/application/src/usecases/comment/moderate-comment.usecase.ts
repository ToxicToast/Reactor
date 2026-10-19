import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import {
  CommentModerator,
  type CommentAnemic,
  type CommentFactory,
  type CommentRepository,
} from '@toxictoast/blog-domain';
import type { ModerateCommentInput } from '../../data/index.js';
import type { CommentModerationService } from '../../services/index.js';

export class ModerateCommentUseCase implements UseCase<
  ModerateCommentInput,
  CommentAnemic
> {
  constructor(
    private readonly factory: CommentFactory,
    private readonly repository: CommentRepository,
    private readonly moderation: CommentModerationService,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: ModerateCommentInput): Promise<Result<CommentAnemic>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Comment', input.id));
    }

    const comment = this.factory.reconstitute(anemic);
    const moderated = this.moderation.moderate(
      comment,
      input.status,
      CommentModerator.ADMIN,
      input.note ?? null,
    );
    if (moderated.isFailure) {
      return Result.fail(moderated.error);
    }

    return this.persistence.persist(comment, this.repository);
  }
}
