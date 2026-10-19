import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import { DomainPersistence, UseCase } from '@toxictoast/shared-application';
import type {
  TagAnemic,
  TagFactory,
  TagRepository,
} from '@toxictoast/blog-domain';
import type { UpdateTagInput } from '../../data/index.js';

export class UpdateTagUseCase implements UseCase<UpdateTagInput, TagAnemic> {
  constructor(
    private readonly factory: TagFactory,
    private readonly repository: TagRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: UpdateTagInput): Promise<Result<TagAnemic>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Tag', input.id));
    }
    const tag = this.factory.reconstitute(anemic);
    const updated = tag.updateTitle(input.title);
    if (updated.isFailure) {
      return Result.fail(updated.error);
    }
    return this.persistence.persist(tag, this.repository);
  }
}
