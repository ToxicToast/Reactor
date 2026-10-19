import { ConflictError, Result } from '@toxictoast/shared-kernel';
import { DomainPersistence, UseCase } from '@toxictoast/shared-application';
import type {
  TagAnemic,
  TagData,
  TagFactory,
  TagRepository,
} from '@toxictoast/blog-domain';

export class CreateTagUseCase implements UseCase<TagData, TagAnemic> {
  constructor(
    private readonly factory: TagFactory,
    private readonly repository: TagRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(data: TagData): Promise<Result<TagAnemic>> {
    const created = this.factory.createDomain(data);
    if (created.isFailure) {
      return Result.fail(created.error);
    }
    const tag = created.value;
    const anemic = tag.toAnemic();

    const existing = await this.repository.findBySlug(anemic.slug, true);
    if (existing) {
      return Result.fail(
        new ConflictError(`Tag with slug "${anemic.slug}" already exists`),
      );
    }
    return this.persistence.persist(tag, this.repository);
  }
}
