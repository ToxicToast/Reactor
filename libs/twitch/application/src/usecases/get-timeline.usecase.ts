import type { UseCase } from '@toxictoast/shared-application';
import { Result, ValidationError } from '@toxictoast/shared-kernel';
import {
  statsDayOf,
  type ChannelStatsRepository,
  type TimelinePoint,
} from '@toxictoast/twitch-domain';
import type { GetTimelineInput } from '../data/index.js';
import type { TwitchStatsConfig } from '../interfaces/index.js';

export class GetTimelineUseCase implements UseCase<
  GetTimelineInput,
  Array<TimelinePoint>
> {
  constructor(
    private readonly channels: ChannelStatsRepository,
    private readonly config: TwitchStatsConfig,
  ) {}

  async execute(
    input: GetTimelineInput,
  ): Promise<Result<Array<TimelinePoint>>> {
    if (input.from > input.to) {
      return Result.fail(new ValidationError('from must not be after to'));
    }

    return Result.ok(
      await this.channels.timeline(
        input.channel_id,
        input.metric,
        input.interval,
        {
          from: statsDayOf(input.from, this.config.time_zone),
          to: statsDayOf(input.to, this.config.time_zone),
        },
      ),
    );
  }
}
