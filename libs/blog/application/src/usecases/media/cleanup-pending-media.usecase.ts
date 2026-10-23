import { Result, type Clock } from '@toxictoast/shared-kernel';
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
import type { CleanupPendingMediaOutput } from '../../data/index.js';

const HOUR_MS = 60 * 60 * 1000;

export class CleanupPendingMediaUseCase implements UseCase<
  void,
  CleanupPendingMediaOutput
> {
  constructor(
    private readonly factory: MediaFactory,
    private readonly repository: MediaRepository,
    private readonly storage: FileStorage,
    private readonly persistence: DomainPersistence,
    private readonly clock: Clock,
    private readonly maxAgeHours: number,
  ) {}

  async execute(): Promise<Result<CleanupPendingMediaOutput>> {
    const olderThan = new Date(
      this.clock.now().getTime() - this.maxAgeHours * HOUR_MS,
    );
    const pending = await this.repository.findByStatus(
      MediaStatus.PENDING,
      olderThan,
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
