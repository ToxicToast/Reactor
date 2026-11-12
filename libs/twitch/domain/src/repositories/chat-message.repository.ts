import type { Optional } from '@toxictoast/shared-types';
import type { ChatMessage, ChatMessageFilter } from '../interfaces/index.js';
import type { ChatDeletionReason } from '../types/index.js';

export interface ChatMessageRepository {
  record(message: ChatMessage): Promise<boolean>;
  markDeleted(
    channelId: string,
    messageId: string,
    at: Date,
    reason: ChatDeletionReason,
  ): Promise<void>;
  markUserCleared(
    channelId: string,
    userId: string,
    since: Date,
    at: Date,
    reason: ChatDeletionReason,
  ): Promise<number>;
  list(
    filter: ChatMessageFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<ChatMessage>>;
  deleteSentBefore(cutoff: Date): Promise<number>;
}
