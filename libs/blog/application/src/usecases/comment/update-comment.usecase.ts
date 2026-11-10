import type { Result } from '@toxictoast/shared-kernel';
import type {
  AggregateEditor,
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  CommentAnemic,
  CommentDomain,
  CommentFactory,
  CommentRepository,
} from '@toxictoast/blog-domain';
import type { UpdateCommentInput } from '../../data/index.js';
import { createCommentEditor } from '../../functions/index.js';

export class UpdateCommentUseCase implements UseCase<
  UpdateCommentInput,
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

  execute(input: UpdateCommentInput): Promise<Result<CommentAnemic>> {
    return this.editor.change(input.id, (comment) =>
      comment.updateContent(input.content, input.author_id),
    );
  }
}
