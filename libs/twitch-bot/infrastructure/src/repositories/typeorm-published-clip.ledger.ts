import type { TransactionContext } from '@toxictoast/shared-persistence';
import type { Clock } from '@toxictoast/shared-kernel';
import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';
import type { DataSource } from 'typeorm';
import type { TwitchPublishedClipRow } from '../interfaces/index.js';
import { TwitchPublishedClipSchema } from '../schemas/index.js';
import { TypeOrmPublishedLedger } from './typeorm-published.ledger.js';

export class TypeOrmPublishedClipLedger extends TypeOrmPublishedLedger<TwitchPublishedClipRow> {
  constructor(
    dataSource: DataSource,
    context: TransactionContext,
    clock: Clock,
  ) {
    super(dataSource, context, TwitchPublishedClipSchema, clock);
  }

  protected rowOf(
    channelId: TrackedChannelId,
    id: string,
    publishedAt: Date,
  ): TwitchPublishedClipRow {
    return { channel_id: channelId, clip_id: id, published_at: publishedAt };
  }

  protected idOf(row: TwitchPublishedClipRow): string {
    return row.clip_id;
  }
}
