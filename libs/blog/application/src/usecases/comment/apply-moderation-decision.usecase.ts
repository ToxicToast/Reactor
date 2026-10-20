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
  type CommentDomain,
} from '@toxictoast/blog-domain';
import type { ApplyModerationDecisionInput } from '../../data/index.js';
import type { CommentModerationService } from '../../services/index.js';
import type { Nullable } from '@toxictoast/shared-types';

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

    const comment = this.factory.reconstitute(anemic);
    const note = input.note ?? null;
    const moderated = this.decide(comment, input.decision, note);
    if (moderated.isFailure) {
      return Result.fail(moderated.error);
    }

    return this.persistence.persist(comment, this.repository);
  }

  private decide(
    comment: CommentDomain,
    decision: CommentStatus,
    note: Nullable<string>,
  ): Result<void> {
    if (decision === CommentStatus.PENDING) {
      return comment.markForReview(CommentModerator.AI, note);
    }
    return this.moderation.moderate(
      comment,
      decision,
      CommentModerator.AI,
      note,
    );
  }
}
