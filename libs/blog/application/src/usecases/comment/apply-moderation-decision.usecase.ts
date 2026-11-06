import type { Result } from '@toxictoast/shared-kernel';
import {
  INCLUDING_DELETED,
  type AggregateEditor,
  type DomainPersistence,
  type UseCase,
} from '@toxictoast/shared-application';
import {
  CommentModerator,
  type CommentAnemic,
  type CommentDomain,
  type CommentFactory,
  type CommentRepository,
} from '@toxictoast/blog-domain';
import type { ApplyModerationDecisionInput } from '../../data/index.js';
import { createCommentEditor } from '../../functions/index.js';

export class ApplyModerationDecisionUseCase implements UseCase<
  ApplyModerationDecisionInput,
  CommentAnemic
> {
  private readonly editor: AggregateEditor<CommentAnemic, CommentDomain>;

  constructor(
    factory: CommentFactory,
    repository: CommentRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createCommentEditor(factory, repository, persistence);
  }

  execute(input: ApplyModerationDecisionInput): Promise<Result<CommentAnemic>> {
    return this.editor.change(
      input.id,
      (comment) =>
        comment.applyDecision(
          input.decision,
          CommentModerator.AI,
          input.note ?? null,
        ),
      INCLUDING_DELETED,
    );
  }
}
