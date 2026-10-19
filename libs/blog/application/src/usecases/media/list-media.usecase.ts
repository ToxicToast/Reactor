import { Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import type { MediaAnemic, MediaRepository } from '@toxictoast/blog-domain';
import type { ListMediaInput } from '../../data/index.js';

export class ListMediaUseCase implements UseCase<
  ListMediaInput,
  Array<MediaAnemic>
> {
  constructor(private readonly repository: MediaRepository) {}

  async execute(input: ListMediaInput): Promise<Result<Array<MediaAnemic>>> {
    const all = await this.repository.findList(
      input.limit,
      input.offset,
      input.withDeleted,
    );
    if (input.status === undefined) {
      return Result.ok(all);
    }
    return Result.ok(all.filter((media) => media.status === input.status));
  }
}
