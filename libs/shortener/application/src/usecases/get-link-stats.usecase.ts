import type { UseCase } from '@toxictoast/shared-application';
import {
  NotFoundError,
  Result,
  ValidationError,
  type DomainContext,
} from '@toxictoast/shared-kernel';
import { TIME_MS } from '@toxictoast/shared-types';
import type {
  LinkClickRepository,
  LinkClickStats,
  LinkRepository,
} from '@toxictoast/shortener-domain';
import { LINK_STATS } from '../constants/index.js';
import type { GetLinkStatsInput } from '../data/index.js';
import type { ShortenerStatsConfig } from '../interfaces/index.js';

export class GetLinkStatsUseCase implements UseCase<
  GetLinkStatsInput,
  LinkClickStats
> {
  constructor(
    private readonly links: LinkRepository,
    private readonly clicks: LinkClickRepository,
    private readonly config: ShortenerStatsConfig,
    private readonly ctx: DomainContext,
  ) {}

  async execute(input: GetLinkStatsInput): Promise<Result<LinkClickStats>> {
    const to = input.to ?? this.ctx.date.now();
    const from =
      input.from ??
      new Date(to.getTime() - LINK_STATS.DEFAULT_DAYS * TIME_MS.DAY);
    if (from > to) {
      return Result.fail(new ValidationError('from must not be after to'));
    }

    const link = await this.links.findById(input.id, true);
    if (!link) {
      return Result.fail(new NotFoundError('Link', input.id));
    }

    return Result.ok(
      await this.clicks.stats(
        input.id,
        { from, to },
        this.config.time_zone,
        LINK_STATS.TOP,
      ),
    );
  }
}
