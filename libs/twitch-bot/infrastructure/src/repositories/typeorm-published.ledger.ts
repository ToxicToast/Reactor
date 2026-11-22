import {
  insertMissing,
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Clock } from '@toxictoast/shared-kernel';
import type { PublishedLedger } from '@toxictoast/twitch-bot-application';
import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import type { DataSource, EntitySchema, ObjectLiteral } from 'typeorm';

export abstract class TypeOrmPublishedLedger<TRow extends ObjectLiteral>
  extends TypeOrmTableRepository<TRow>
  implements PublishedLedger
{
  protected constructor(
    dataSource: DataSource,
    context: TransactionContext,
    schema: EntitySchema<TRow>,
    private readonly clock: Clock,
  ) {
    super(dataSource, context, schema);
  }

  protected abstract rowOf(
    channelId: TwitchChannelId,
    id: string,
    publishedAt: Date,
  ): TRow;

  protected abstract idOf(row: TRow): string;

  async markPublished(
    channelId: TwitchChannelId,
    ids: ReadonlyArray<string>,
  ): Promise<Array<string>> {
    const publishedAt = this.clock.now();
    const rows = await insertMissing(
      this.repository(),
      [...new Set(ids)].map((id) => this.rowOf(channelId, id, publishedAt)),
    );
    return rows.map((row) => this.idOf(row));
  }
}
