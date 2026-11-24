import type { TransactionContext } from '@toxictoast/shared-persistence';
import type { Clock } from '@toxictoast/shared-kernel';
import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';
import type { DataSource } from 'typeorm';
import type { TwitchPublishedVideoRow } from '../interfaces/index.js';
import { TwitchPublishedVideoSchema } from '../schemas/index.js';
import { TypeOrmPublishedLedger } from './typeorm-published.ledger.js';

export class TypeOrmPublishedVideoLedger extends TypeOrmPublishedLedger<TwitchPublishedVideoRow> {
  constructor(
    dataSource: DataSource,
    context: TransactionContext,
    clock: Clock,
  ) {
    super(dataSource, context, TwitchPublishedVideoSchema, clock);
  }

  protected rowOf(
    channelId: TrackedChannelId,
    id: string,
    publishedAt: Date,
  ): TwitchPublishedVideoRow {
    return { channel_id: channelId, video_id: id, published_at: publishedAt };
  }

  protected idOf(row: TwitchPublishedVideoRow): string {
    return row.video_id;
  }
}
