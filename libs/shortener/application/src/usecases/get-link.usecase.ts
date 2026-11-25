import type { UseCase } from '@toxictoast/shared-application';
import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { LinkAnemic, LinkRepository } from '@toxictoast/shortener-domain';
import type { LinkIdInput } from '../data/index.js';

export class GetLinkUseCase implements UseCase<LinkIdInput, LinkAnemic> {
  constructor(private readonly repository: LinkRepository) {}

  async execute(input: LinkIdInput): Promise<Result<LinkAnemic>> {
    const anemic = await this.repository.findById(input.id, input.withDeleted);
    if (!anemic) {
      return Result.fail(new NotFoundError('Link', input.id));
    }
    return Result.ok(anemic);
  }
}
