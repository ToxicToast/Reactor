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
import type { PublishPostInput } from '../../data/index.js';

export class PublishPostUseCase implements UseCase<
  PublishPostInput,
  PostAnemic
> {
  constructor(
    private readonly factory: PostFactory,
    private readonly repository: PostRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: PublishPostInput): Promise<Result<PostAnemic>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Post', input.id));
    }

    const post = this.factory.reconstitute(anemic);
    const published = post.publishPost(input.published_at);
    if (published.isFailure) {
      return Result.fail(published.error);
    }

    return this.persistence.persist(post, this.repository);
  }
}
