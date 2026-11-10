import { Result } from '@toxictoast/shared-kernel';
import type {
  AggregateEditor,
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  PostAnemic,
  PostDomain,
  PostFactory,
  PostReferencesService,
  PostRepository,
} from '@toxictoast/blog-domain';
import type { UpdatePostInput } from '../../data/index.js';
import { createPostEditor } from '../../functions/index.js';

export class UpdatePostUseCase implements UseCase<UpdatePostInput, PostAnemic> {
  private readonly editor: AggregateEditor<PostAnemic, PostDomain>;

  constructor(
    factory: PostFactory,
    repository: PostRepository,
    private readonly references: PostReferencesService,
    persistence: DomainPersistence,
  ) {
    this.editor = createPostEditor(factory, repository, persistence);
  }

  execute(input: UpdatePostInput): Promise<Result<PostAnemic>> {
    return this.editor.change(input.id, (post) => this.update(post, input));
  }

  private async update(
    post: PostDomain,
    input: UpdatePostInput,
  ): Promise<Result<void>> {
    const references = await this.references.validate(input);
    if (references.isFailure) {
      return Result.fail(references.error);
    }

    const { id: _id, ...data } = input;
    return post.updatePost(data);
  }
}
