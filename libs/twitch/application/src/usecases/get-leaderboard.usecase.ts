import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  LeaderboardEntry,
  ViewerStatsRepository,
} from '@toxictoast/twitch-domain';
import type { GetLeaderboardInput } from '../data/index.js';
import { clampLimit, dayRangeOf, statsRangeOf } from '../functions/index.js';
import type { TwitchStatsConfig } from '../interfaces/index.js';

export class GetLeaderboardUseCase implements UseCase<
  GetLeaderboardInput,
  Array<LeaderboardEntry>
> {
  constructor(
    private readonly viewers: ViewerStatsRepository,
    private readonly config: TwitchStatsConfig,
  ) {}

  async execute(
    input: GetLeaderboardInput,
  ): Promise<Result<Array<LeaderboardEntry>>> {
    return Result.ok(
      await this.viewers.leaderboard(
        input.channel_id,
        input.metric,
        dayRangeOf(statsRangeOf(input), this.config.time_zone),
        clampLimit(input.limit),
      ),
    );
  }
}
