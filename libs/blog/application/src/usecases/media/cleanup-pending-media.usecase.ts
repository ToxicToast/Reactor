import { Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  FileStorage,
  UseCase,
} from '@toxictoast/shared-application';
import {
  MediaStatus,
  type MediaFactory,
  type MediaRepository,
} from '@toxictoast/blog-domain';
import type {
  CleanupPendingMediaInput,
  CleanupPendingMediaOutput,
} from '../../data/index.js';

export class CleanupPendingMediaUseCase implements UseCase<
  CleanupPendingMediaInput,
  CleanupPendingMediaOutput
> {
  constructor(
    private readonly factory: MediaFactory,
    private readonly repository: MediaRepository,
    private readonly storage: FileStorage,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(
    input: CleanupPendingMediaInput,
  ): Promise<Result<CleanupPendingMediaOutput>> {
    const pending = await this.repository.findByStatus(
      MediaStatus.PENDING,
      input.olderThan,
    );

    let removed = 0;
    for (const anemic of pending) {
      const media = this.factory.reconstitute(anemic);
      media.deleteMedia();

      const saved = await this.persistence.persist(media, this.repository);
      if (saved.isFailure) {
        continue;
      }

      await this.storage.delete(anemic.object_key);
      removed++;
    }

    return Result.ok({ removed });
  }
}
