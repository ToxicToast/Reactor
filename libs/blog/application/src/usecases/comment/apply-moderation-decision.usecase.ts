import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import {
  CommentModerator,
  CommentStatus,
  type CommentAnemic,
  type CommentFactory,
  type CommentRepository,
} from '@toxictoast/blog-domain';
import type { ApplyModerationDecisionInput } from '../../data/index.js';
import type { CommentModerationService } from '../../services/index.js';

export class ApplyModerationDecisionUseCase implements UseCase<
  ApplyModerationDecisionInput,
  CommentAnemic
> {
  constructor(
    private readonly factory: CommentFactory,
    private readonly repository: CommentRepository,
    private readonly moderation: CommentModerationService,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(
    input: ApplyModerationDecisionInput,
  ): Promise<Result<CommentAnemic>> {
    const anemic = await this.repository.findById(input.id, true);
    if (!anemic) {
      return Result.fail(new NotFoundError('Comment', input.id));
    }

    if (anemic.deleted_at !== null || anemic.status !== CommentStatus.PENDING) {
      return Result.ok(anemic);
    }

    if (input.decision === 'review') {
      return Result.ok(anemic);
    }

    const comment = this.factory.reconstitute(anemic);
    const moderated = this.moderation.moderate(
      comment,
      input.decision,
      CommentModerator.AI,
      input.note ?? null,
    );
    if (moderated.isFailure) {
      return Result.fail(moderated.error);
    }

    return this.persistence.persist(comment, this.repository);
  }
}
