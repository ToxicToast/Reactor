import type { Result } from '@toxictoast/shared-kernel';
import {
  INCLUDING_DELETED,
  type AggregateEditor,
  type DomainPersistence,
  type UseCase,
} from '@toxictoast/shared-application';
import type {
  CommentAnemic,
  CommentDomain,
  CommentFactory,
  CommentRepository,
} from '@toxictoast/blog-domain';
import type { CommentIdInput } from '../../data/index.js';
import { createCommentEditor } from '../../functions/index.js';

export class DeleteCommentUseCase implements UseCase<
  CommentIdInput,
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

  execute(input: CommentIdInput): Promise<Result<CommentAnemic>> {
    return this.editor.change(
      input.id,
      (comment) => comment.delete(),
      INCLUDING_DELETED,
    );
  }
}
