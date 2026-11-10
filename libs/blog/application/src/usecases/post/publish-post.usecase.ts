import type { Result } from '@toxictoast/shared-kernel';
import type {
  AggregateEditor,
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  PostAnemic,
  PostDomain,
  PostFactory,
  PostRepository,
} from '@toxictoast/blog-domain';
import type { PublishPostInput } from '../../data/index.js';
import { createPostEditor } from '../../functions/index.js';

export class PublishPostUseCase implements UseCase<
  PublishPostInput,
  PostAnemic
> {
  private readonly editor: AggregateEditor<PostAnemic, PostDomain>;

  constructor(
    factory: PostFactory,
    repository: PostRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createPostEditor(factory, repository, persistence);
  }

  execute(input: PublishPostInput): Promise<Result<PostAnemic>> {
    return this.editor.change(input.id, (post) =>
      post.publishPost(input.published_at),
    );
  }
}
