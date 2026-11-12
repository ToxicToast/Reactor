import type { UseCase } from '@toxictoast/shared-application';
import { Result, type Clock } from '@toxictoast/shared-kernel';
import {
  retentionCutoff,
  type ChatMessageRepository,
} from '@toxictoast/twitch-domain';
import type { PurgeExpiredChatMessagesOutput } from '../data/index.js';
import type { TwitchChatConfig } from '../interfaces/index.js';

export class PurgeExpiredChatMessagesUseCase implements UseCase<
  void,
  PurgeExpiredChatMessagesOutput
> {
  constructor(
    private readonly messages: ChatMessageRepository,
    private readonly config: TwitchChatConfig,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<Result<PurgeExpiredChatMessagesOutput>> {
    const removed = await this.messages.deleteSentBefore(
      retentionCutoff(this.clock.now(), this.config.retention_days),
    );
    return Result.ok({ removed });
  }
}
