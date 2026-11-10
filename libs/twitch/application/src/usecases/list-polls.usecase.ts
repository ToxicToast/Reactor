import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type { PollRepository, StoredPoll } from '@toxictoast/twitch-domain';
import type { ListPollsInput } from '../data/index.js';
import { clampLimit, statsRangeOf } from '../functions/index.js';

export class ListPollsUseCase implements UseCase<
  ListPollsInput,
  Array<StoredPoll>
> {
  constructor(private readonly polls: PollRepository) {}

  async execute(input: ListPollsInput): Promise<Result<Array<StoredPoll>>> {
    return Result.ok(
      await this.polls.list(
        input.channel_id,
        statsRangeOf(input),
        clampLimit(input.limit),
        input.offset,
      ),
    );
  }
}
