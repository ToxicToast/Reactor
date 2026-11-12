import type { UseCase } from '@toxictoast/shared-application';
import { Result, type Clock } from '@toxictoast/shared-kernel';
import {
  retentionCutoff,
  type ChatMessageRepository,
} from '@toxictoast/twitch-domain';
import type { PurgeExpiredChatMessagesOutput } from '../data/index.js';

export class PurgeExpiredChatMessagesUseCase implements UseCase<
  void,
  PurgeExpiredChatMessagesOutput
> {
  constructor(
    private readonly messages: ChatMessageRepository,
    private readonly retentionDays: number,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<Result<PurgeExpiredChatMessagesOutput>> {
    const removed = await this.messages.deleteSentBefore(
      retentionCutoff(this.clock.now(), this.retentionDays),
    );
    return Result.ok({ removed });
  }
}
