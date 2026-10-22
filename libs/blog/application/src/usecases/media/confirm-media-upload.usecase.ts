import {
  ConflictError,
  NotFoundError,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  FileStorage,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  MediaAnemic,
  MediaFactory,
  MediaRepository,
} from '@toxictoast/blog-domain';
import type { MediaIdInput } from '../../data/index.js';

export class ConfirmMediaUploadUseCase implements UseCase<
  MediaIdInput,
  MediaAnemic
> {
  constructor(
    private readonly factory: MediaFactory,
    private readonly repository: MediaRepository,
    private readonly storage: FileStorage,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: MediaIdInput): Promise<Result<MediaAnemic>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Media', input.id));
    }

    const file = await this.storage.stat(anemic.object_key);
    if (!file) {
      return Result.fail(new ConflictError('File has not been uploaded yet'));
    }
    if (file.mime_type !== anemic.mime_type) {
      return Result.fail(
        new ValidationError(
          `Uploaded file is ${file.mime_type}, expected ${anemic.mime_type}`,
        ),
      );
    }

    const media = this.factory.reconstitute(anemic);
    const ready = media.markReady(file.size);
    if (ready.isFailure) {
      return Result.fail(ready.error);
    }

    return this.persistence.persist(media, this.repository);
  }
}
