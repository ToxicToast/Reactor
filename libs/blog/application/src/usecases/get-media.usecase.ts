import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import type { MediaAnemic, MediaRepository } from '@toxictoast/blog-domain';
import type { MediaIdInput } from '../data/index.js';

export class GetMediaUseCase implements UseCase<MediaIdInput, MediaAnemic> {
  constructor(private readonly repository: MediaRepository) {}

  async execute(input: MediaIdInput): Promise<Result<MediaAnemic>> {
    const anemic = await this.repository.findById(input.id, input.withDeleted);
    if (!anemic) {
      return Result.fail(new NotFoundError('Media', input.id));
    }
    return Result.ok(anemic);
  }
}
