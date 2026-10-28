import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  StreamSessionAnemic,
  StreamSessionRepository,
} from '@toxictoast/twitch-domain';
import type { ListSessionsInput } from '../data/index.js';
import { clampLimit, statsRangeOf } from '../functions/index.js';

export class ListSessionsUseCase implements UseCase<
  ListSessionsInput,
  Array<StreamSessionAnemic>
> {
  constructor(private readonly sessions: StreamSessionRepository) {}

  async execute(
    input: ListSessionsInput,
  ): Promise<Result<Array<StreamSessionAnemic>>> {
    return Result.ok(
      await this.sessions.findByChannel(
        input.channel_id,
        statsRangeOf(input),
        clampLimit(input.limit),
        input.offset,
      ),
    );
  }
}
