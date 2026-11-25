import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type { LinkAnemic, LinkRepository } from '@toxictoast/shortener-domain';
import type { ListLinksInput } from '../data/index.js';

export class ListLinksUseCase implements UseCase<
  ListLinksInput,
  Array<LinkAnemic>
> {
  constructor(private readonly repository: LinkRepository) {}

  async execute(input: ListLinksInput): Promise<Result<Array<LinkAnemic>>> {
    return Result.ok(
      await this.repository.findList(
        input.limit,
        input.offset,
        input.withDeleted,
      ),
    );
  }
}
