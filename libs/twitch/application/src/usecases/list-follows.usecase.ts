import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import {
  FollowStates,
  type Follow,
  type FollowRepository,
} from '@toxictoast/twitch-domain';
import type { ListFollowsInput } from '../data/index.js';
import { clampLimit } from '../functions/index.js';

export class ListFollowsUseCase implements UseCase<
  ListFollowsInput,
  Array<Follow>
> {
  constructor(private readonly follows: FollowRepository) {}

  async execute(input: ListFollowsInput): Promise<Result<Array<Follow>>> {
    return Result.ok(
      await this.follows.list(
        {
          channel_id: input.channel_id,
          user_id: input.user_id ?? null,
          state: input.state ?? FollowStates.ALL,
        },
        clampLimit(input.limit),
        input.offset,
      ),
    );
  }
}
