import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  TagAnemic,
  TagFactory,
  TagRepository,
} from '@toxictoast/blog-domain';
import type { TagIdInput } from '../../data/index.js';

export class RestoreTagUseCase implements UseCase<TagIdInput, TagAnemic> {
  constructor(
    private readonly factory: TagFactory,
    private readonly repository: TagRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: TagIdInput): Promise<Result<TagAnemic>> {
    const anemic = await this.repository.findById(input.id, true);
    if (!anemic) {
      return Result.fail(new NotFoundError('Tag', input.id));
    }

    const tag = this.factory.reconstitute(anemic);
    tag.restoreTag();

    return this.persistence.persist(tag, this.repository);
  }
}
