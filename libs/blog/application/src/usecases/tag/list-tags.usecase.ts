import { Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import type { TagAnemic, TagRepository } from '@toxictoast/blog-domain';
import type { ListTagsInput } from '../../data/index.js';

export class ListTagsUseCase implements UseCase<
  ListTagsInput,
  Array<TagAnemic>
> {
  constructor(private readonly repository: TagRepository) {}

  async execute(input: ListTagsInput): Promise<Result<Array<TagAnemic>>> {
    const tags = await this.repository.findList(
      input.limit,
      input.offset,
      input.withDeleted,
    );
    return Result.ok(tags);
  }
}
