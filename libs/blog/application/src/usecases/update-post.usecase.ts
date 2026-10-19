import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  PostAnemic,
  PostFactory,
  PostRepository,
} from '@toxictoast/blog-domain';
import type { UpdatePostInput } from '../data/index.js';
import type { PostReferencesService } from '../services/index.js';

export class UpdatePostUseCase implements UseCase<UpdatePostInput, PostAnemic> {
  constructor(
    private readonly factory: PostFactory,
    private readonly repository: PostRepository,
    private readonly references: PostReferencesService,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: UpdatePostInput): Promise<Result<PostAnemic>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Post', input.id));
    }

    const references = await this.references.validate(input);
    if (references.isFailure) {
      return Result.fail(references.error);
    }

    const { id: _id, ...data } = input;
    const post = this.factory.reconstitute(anemic);
    const updated = post.updatePost(data);
    if (updated.isFailure) {
      return Result.fail(updated.error);
    }

    return this.persistence.persist(post, this.repository);
  }
}
