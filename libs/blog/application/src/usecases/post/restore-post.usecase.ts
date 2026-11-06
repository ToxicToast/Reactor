import type { Result } from '@toxictoast/shared-kernel';
import {
  INCLUDING_DELETED,
  type AggregateEditor,
  type DomainPersistence,
  type UseCase,
} from '@toxictoast/shared-application';
import type {
  PostAnemic,
  PostDomain,
  PostFactory,
  PostRepository,
} from '@toxictoast/blog-domain';
import type { PostIdInput } from '../../data/index.js';
import { createPostEditor } from '../../functions/index.js';

export class RestorePostUseCase implements UseCase<PostIdInput, PostAnemic> {
  private readonly editor: AggregateEditor<PostAnemic, PostDomain>;

  constructor(
    factory: PostFactory,
    repository: PostRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createPostEditor(factory, repository, persistence);
  }

  execute(input: PostIdInput): Promise<Result<PostAnemic>> {
    return this.editor.change(
      input.id,
      (post) => post.restorePost(),
      INCLUDING_DELETED,
    );
  }
}
