import { paginate } from '@toxictoast/shared-application';
import type { Optional } from '@toxictoast/shared-types';
import type {
  ChatDeletionReason,
  ChatMessage,
  ChatMessageFilter,
  ChatMessageRepository,
} from '@toxictoast/twitch-domain';
import { isWithinStatsRange } from './range-filters.js';

/** Die Suche ist hier ein einfaches „alle Wörter enthalten“; den echten Volltext prüft die Integration-Spec. */
const matchesQuery = (text: string, query: string): boolean => {
  const lower = text.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => lower.includes(word));
};

export class InMemoryChatMessageRepository implements ChatMessageRepository {
  readonly items = new Map<string, ChatMessage>();

  async record(message: ChatMessage): Promise<boolean> {
    if (this.items.has(message.message_id)) {
      return false;
    }
    this.items.set(message.message_id, message);
    return true;
  }

  async markDeleted(
    channelId: string,
    messageId: string,
    at: Date,
    reason: ChatDeletionReason,
  ): Promise<void> {
    this.mark(
      (message) => {
        return (
          message.channel_id === channelId && message.message_id === messageId
        );
      },
      at,
      reason,
    );
  }

  async markUserCleared(
    channelId: string,
    userId: string,
    since: Date,
    at: Date,
    reason: ChatDeletionReason,
  ): Promise<number> {
    return this.mark(
      (message) => {
        return (
          message.channel_id === channelId &&
          message.user_id === userId &&
          message.sent_at >= since
        );
      },
      at,
      reason,
    );
  }

  async list(
    filter: ChatMessageFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<ChatMessage>> {
    const messages = [...this.items.values()]
      .filter((message) => {
        return (
          message.channel_id === filter.channel_id &&
          (filter.user_id === null || message.user_id === filter.user_id) &&
          (filter.session_id === null ||
            message.session_id === filter.session_id) &&
          (filter.include_deleted || message.deleted_at === null) &&
          (filter.query === null || matchesQuery(message.text, filter.query)) &&
          isWithinStatsRange(message.sent_at, filter)
        );
      })
      .sort((a, b) => b.sent_at.getTime() - a.sent_at.getTime());
    return paginate(messages, limit, offset);
  }

  private mark(
    matches: (message: ChatMessage) => boolean,
    at: Date,
    reason: ChatDeletionReason,
  ): number {
    let marked = 0;
    for (const message of this.items.values()) {
      if (message.deleted_at === null && matches(message)) {
        this.items.set(message.message_id, {
          ...message,
          deleted_at: at,
          deleted_reason: reason,
        });
        marked++;
      }
    }
    return marked;
  }
}
