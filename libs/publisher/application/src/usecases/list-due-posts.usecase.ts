import type { UseCase } from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import {
  isMetricsDue,
  METRICS_SCHEDULE,
  type DuePost,
  type PostCheckRepository,
} from '@toxictoast/publisher-domain';
import { METRICS_COLLECTION } from '../constants/index.js';

/** fällig nach dem Takt je Alter; ausgesetzt nach METRICS_SCHEDULE.MAX_FAILURES Fehlversuchen in Folge */
export class ListDuePostsUseCase implements UseCase<void, Array<DuePost>> {
  constructor(
    private readonly checks: PostCheckRepository,
    private readonly ctx: DomainContext,
  ) {}

  async execute(): Promise<Result<Array<DuePost>>> {
    const now = this.ctx.date.now();
    const candidates = await this.checks.candidates(
      METRICS_SCHEDULE.MAX_FAILURES,
    );
    return Result.ok(
      candidates
        .filter((candidate) => {
          return isMetricsDue(
            candidate.published_at,
            candidate.checked_at,
            now,
          );
        })
        .slice(0, METRICS_COLLECTION.BATCH_SIZE),
    );
  }
}
