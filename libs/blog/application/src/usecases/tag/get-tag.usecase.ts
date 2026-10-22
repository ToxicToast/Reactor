import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import type { TagAnemic, TagRepository } from '@toxictoast/blog-domain';
import type { TagIdInput } from '../../data/index.js';

export class GetTagUseCase implements UseCase<TagIdInput, TagAnemic> {
  constructor(private readonly repository: TagRepository) {}

  async execute(input: TagIdInput): Promise<Result<TagAnemic>> {
    const anemic = await this.repository.findById(input.id, input.withDeleted);
    if (!anemic) {
      return Result.fail(new NotFoundError('Tag', input.id));
    }
    return Result.ok(anemic);
  }
}
