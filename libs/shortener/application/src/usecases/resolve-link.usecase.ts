import type { UseCase } from '@toxictoast/shared-application';
import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { LinkFactory, LinkRepository } from '@toxictoast/shortener-domain';
import type { ResolveLinkInput, ResolveLinkOutput } from '../data/index.js';

/** Für den Redirect: gelöschte und deaktivierte Links verhalten sich wie unbekannte. */
export class ResolveLinkUseCase implements UseCase<
  ResolveLinkInput,
  ResolveLinkOutput
> {
  constructor(
    private readonly factory: LinkFactory,
    private readonly repository: LinkRepository,
  ) {}

  async execute(input: ResolveLinkInput): Promise<Result<ResolveLinkOutput>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic || !this.factory.reconstitute(anemic).isResolvable) {
      return Result.fail(new NotFoundError('Link', input.id));
    }
    return Result.ok({ target_url: anemic.target_url });
  }
}
