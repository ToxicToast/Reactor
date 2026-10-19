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
import type { UpdateMediaAltTextInput } from '../data/index.js';

export class UpdateMediaAltTextUseCase implements UseCase<
  UpdateMediaAltTextInput,
  MediaAnemic
> {
  constructor(
    private readonly factory: MediaFactory,
    private readonly repository: MediaRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: UpdateMediaAltTextInput): Promise<Result<MediaAnemic>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Media', input.id));
    }

    const media = this.factory.reconstitute(anemic);
    const updated = media.updateAltText(input.alt_text);
    if (updated.isFailure) {
      return Result.fail(updated.error);
    }

    return this.persistence.persist(media, this.repository);
  }
}
