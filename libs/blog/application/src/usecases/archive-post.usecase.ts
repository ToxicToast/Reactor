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
import type { PostIdInput } from '../data/index.js';

export class ArchivePostUseCase implements UseCase<PostIdInput, PostAnemic> {
  constructor(
    private readonly factory: PostFactory,
    private readonly repository: PostRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: PostIdInput): Promise<Result<PostAnemic>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Post', input.id));
    }

    const post = this.factory.reconstitute(anemic);
    const archived = post.archivePost();
    if (archived.isFailure) {
      return Result.fail(archived.error);
    }

    return this.persistence.persist(post, this.repository);
  }
}
