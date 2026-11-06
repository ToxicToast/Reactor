import type { Result } from '@toxictoast/shared-kernel';
import type {
  AggregateEditor,
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import {
  CommentModerator,
  type CommentAnemic,
  type CommentDomain,
  type CommentFactory,
  type CommentRepository,
} from '@toxictoast/blog-domain';
import type { ModerateCommentInput } from '../../data/index.js';
import { createCommentEditor } from '../../functions/index.js';
import type { CommentModerationService } from '../../services/index.js';

export class ModerateCommentUseCase implements UseCase<
  ModerateCommentInput,
  CommentAnemic
> {
  private readonly editor: AggregateEditor<CommentAnemic, CommentDomain>;

  constructor(
    factory: CommentFactory,
    repository: CommentRepository,
    private readonly moderation: CommentModerationService,
    persistence: DomainPersistence,
  ) {
    this.editor = createCommentEditor(factory, repository, persistence);
  }

  execute(input: ModerateCommentInput): Promise<Result<CommentAnemic>> {
    return this.editor.change(input.id, (comment) =>
      this.moderation.moderate(
        comment,
        input.status,
        CommentModerator.ADMIN,
        input.note ?? null,
      ),
    );
  }
}
