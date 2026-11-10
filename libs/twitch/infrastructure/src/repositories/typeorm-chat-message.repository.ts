import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Optional } from '@toxictoast/shared-types';
import type {
  ChatDeletionReason,
  ChatMessage,
  ChatMessageFilter,
  ChatMessageRepository,
} from '@toxictoast/twitch-domain';
import type { DataSource, ObjectLiteral } from 'typeorm';
import { insertOnce, whereWithin } from '../functions/index.js';
import { TwitchChatMessageSchema } from '../schemas/index.js';

/** sprachneutral, weil im Chat Deutsch, Englisch und Emotes gemischt sind */
const TEXT_SEARCH =
  "to_tsvector('simple', m.text) @@ websearch_to_tsquery('simple', :query)";

export class TypeOrmChatMessageRepository
  extends TypeOrmTableRepository<ChatMessage>
  implements ChatMessageRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchChatMessageSchema);
  }

  record(message: ChatMessage): Promise<boolean> {
    return insertOnce(this.repository(), {
      ...message,
      badges: [...message.badges],
    });
  }

  async markDeleted(
    channelId: string,
    messageId: string,
    at: Date,
    reason: ChatDeletionReason,
  ): Promise<void> {
    await this.markVisible(
      'channel_id = :channelId AND message_id = :messageId',
      { channelId, messageId },
      at,
      reason,
    );
  }

  markUserCleared(
    channelId: string,
    userId: string,
    since: Date,
    at: Date,
    reason: ChatDeletionReason,
  ): Promise<number> {
    return this.markVisible(
      'channel_id = :channelId AND user_id = :userId AND sent_at >= :since',
      { channelId, userId, since },
      at,
      reason,
    );
  }

  list(
    filter: ChatMessageFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<ChatMessage>> {
    const query = this.repository()
      .createQueryBuilder('m')
      .where('m.channel_id = :channelId', { channelId: filter.channel_id });
    if (filter.user_id !== null) {
      query.andWhere('m.user_id = :userId', { userId: filter.user_id });
    }
    if (filter.session_id !== null) {
      query.andWhere('m.session_id = :sessionId', {
        sessionId: filter.session_id,
      });
    }
    if (!filter.include_deleted) {
      query.andWhere('m.deleted_at IS NULL');
    }
    if (filter.query !== null) {
      query.andWhere(TEXT_SEARCH, { query: filter.query });
    }
    return whereWithin(query, 'm.sent_at', filter)
      .orderBy('m.sent_at', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }

  private async markVisible(
    condition: string,
    params: ObjectLiteral,
    at: Date,
    reason: ChatDeletionReason,
  ): Promise<number> {
    const result = await this.repository()
      .createQueryBuilder()
      .update()
      .set({ deleted_at: at, deleted_reason: reason })
      .where(`${condition} AND deleted_at IS NULL`, params)
      .execute();
    return result.affected ?? 0;
  }
}
