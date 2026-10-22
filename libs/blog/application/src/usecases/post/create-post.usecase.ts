import { ConflictError, Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  PostAnemic,
  PostData,
  PostFactory,
  PostRepository,
} from '@toxictoast/blog-domain';
import type { PostReferencesService } from '../../services/index.js';

export class CreatePostUseCase implements UseCase<PostData, PostAnemic> {
  constructor(
    private readonly factory: PostFactory,
    private readonly repository: PostRepository,
    private readonly references: PostReferencesService,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(data: PostData): Promise<Result<PostAnemic>> {
    const created = this.factory.createDomain(data);
    if (created.isFailure) {
      return Result.fail(created.error);
    }

    const post = created.value;
    const slug = post.toAnemic().slug;

    const existing = await this.repository.findBySlug(slug, true);
    if (existing) {
      return Result.fail(
        new ConflictError(`Post with slug "${slug}" already exists`),
      );
    }

    const references = await this.references.validate(data);
    if (references.isFailure) {
      return Result.fail(references.error);
    }

    return this.persistence.persist(post, this.repository);
  }
}
