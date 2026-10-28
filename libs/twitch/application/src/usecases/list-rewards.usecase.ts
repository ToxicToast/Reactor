import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  RewardStat,
  RewardStatsRepository,
} from '@toxictoast/twitch-domain';
import type { RangeQuery } from '../data/index.js';
import { dayRangeOf, statsRangeOf } from '../functions/index.js';
import type { TwitchStatsConfig } from '../interfaces/index.js';

export class ListRewardsUseCase implements UseCase<
  RangeQuery,
  Array<RewardStat>
> {
  constructor(
    private readonly rewards: RewardStatsRepository,
    private readonly config: TwitchStatsConfig,
  ) {}

  async execute(input: RangeQuery): Promise<Result<Array<RewardStat>>> {
    return Result.ok(
      await this.rewards.list(
        input.channel_id,
        dayRangeOf(statsRangeOf(input), this.config.time_zone),
      ),
    );
  }
}
