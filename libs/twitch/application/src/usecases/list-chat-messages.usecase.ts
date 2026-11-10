import type { UseCase } from '@toxictoast/shared-application';
import { Result, ValidationError } from '@toxictoast/shared-kernel';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  ChatMessage,
  ChatMessageRepository,
} from '@toxictoast/twitch-domain';
import { CHAT_LOG } from '../constants/index.js';
import type { ListChatMessagesInput } from '../data/index.js';
import { clampLimit, statsRangeOf } from '../functions/index.js';

const searchOf = (query: Optional<string>): Nullable<string> => {
  const trimmed = query?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
};

export class ListChatMessagesUseCase implements UseCase<
  ListChatMessagesInput,
  Array<ChatMessage>
> {
  constructor(private readonly messages: ChatMessageRepository) {}

  async execute(
    input: ListChatMessagesInput,
  ): Promise<Result<Array<ChatMessage>>> {
    const query = searchOf(input.query);
    if (query !== null && query.length > CHAT_LOG.MAX_QUERY_LENGTH) {
      return Result.fail(
        new ValidationError(
          `query must not be longer than ${CHAT_LOG.MAX_QUERY_LENGTH} characters`,
        ),
      );
    }

    return Result.ok(
      await this.messages.list(
        {
          ...statsRangeOf(input),
          channel_id: input.channel_id,
          user_id: input.user_id ?? null,
          session_id: input.session_id ?? null,
          query,
          include_deleted: input.include_deleted ?? false,
        },
        clampLimit(input.limit),
        input.offset,
      ),
    );
  }
}
