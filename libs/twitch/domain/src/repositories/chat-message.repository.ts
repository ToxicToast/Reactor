import type { Optional } from '@toxictoast/shared-types';
import type { ChatMessage, ChatMessageFilter } from '../interfaces/index.js';
import type { ChatDeletionReason } from '../types/index.js';

export interface ChatMessageRepository {
  /** true, wenn die Nachricht neu war */
  record(message: ChatMessage): Promise<boolean>;
  markDeleted(
    channelId: string,
    messageId: string,
    at: Date,
    reason: ChatDeletionReason,
  ): Promise<void>;
  /** markiert alle noch sichtbaren Nachrichten des Users seit `since`, gibt die Anzahl zurück */
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
}
