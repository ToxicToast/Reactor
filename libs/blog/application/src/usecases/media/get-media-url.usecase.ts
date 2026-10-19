import {
  ConflictError,
  NotFoundError,
  Result,
} from '@toxictoast/shared-kernel';
import type { FileStorage, UseCase } from '@toxictoast/shared-application';
import { MediaStatus, type MediaRepository } from '@toxictoast/blog-domain';
import type { MediaIdInput, MediaUrlOutput } from '../../data/index.js';

export class GetMediaUrlUseCase implements UseCase<
  MediaIdInput,
  MediaUrlOutput
> {
  constructor(
    private readonly repository: MediaRepository,
    private readonly storage: FileStorage,
    private readonly downloadUrlTtl = 60 * 60,
  ) {}

  async execute(input: MediaIdInput): Promise<Result<MediaUrlOutput>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Media', input.id));
    }
    if (anemic.status !== MediaStatus.READY) {
      return Result.fail(new ConflictError('Media is not ready yet'));
    }

    const url = await this.storage.createDownloadUrl(
      anemic.object_key,
      this.downloadUrlTtl,
    );
    return Result.ok({ url, expires_in: this.downloadUrlTtl });
  }
}
