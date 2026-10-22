import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  MediaAnemic,
  MediaFactory,
  MediaRepository,
} from '@toxictoast/blog-domain';
import type { MediaIdInput } from '../../data/index.js';

export class RestoreMediaUseCase implements UseCase<MediaIdInput, MediaAnemic> {
  constructor(
    private readonly factory: MediaFactory,
    private readonly repository: MediaRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: MediaIdInput): Promise<Result<MediaAnemic>> {
    const anemic = await this.repository.findById(input.id, true);
    if (!anemic) {
      return Result.fail(new NotFoundError('Media', input.id));
    }

    const media = this.factory.reconstitute(anemic);
    media.restoreMedia();

    return this.persistence.persist(media, this.repository);
  }
}
