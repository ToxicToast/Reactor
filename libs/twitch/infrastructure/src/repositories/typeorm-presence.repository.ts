import {
  insertMissing,
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import type {
  PresenceEntry,
  PresenceRepository,
} from '@toxictoast/twitch-domain';
import type { DataSource } from 'typeorm';
import { quoteIdentifier } from '../functions/index.js';
import type { PresenceRow } from '../interfaces/index.js';
import { TwitchPresenceSchema } from '../schemas/index.js';

export class TypeOrmPresenceRepository
  extends TypeOrmTableRepository<PresenceRow>
  implements PresenceRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchPresenceSchema);
  }

  async join(channelId: string, userId: string, at: Date): Promise<void> {
    await insertMissing(this.repository(), [
      { channel_id: channelId, user_id: userId, joined_at: at },
    ]);
  }

  async leave(channelId: string, userId: string): Promise<Nullable<Date>> {
    const [row] = await this.query<Pick<PresenceRow, 'joined_at'>>(
      (table) =>
        `WITH removed AS (DELETE FROM ${table} WHERE channel_id = $1 AND user_id = $2 RETURNING joined_at) ` +
        'SELECT joined_at FROM removed',
      [channelId, userId],
    );
    return row?.joined_at ?? null;
  }

  count(channelId: string): Promise<number> {
    return this.repository().countBy({ channel_id: channelId });
  }

  restartAll(channelId: string, at: Date): Promise<Array<PresenceEntry>> {
    return this.query<PresenceEntry>(
      (table) =>
        `WITH previous AS (SELECT user_id, joined_at FROM ${table} WHERE channel_id = $1 FOR UPDATE), ` +
        `restarted AS (UPDATE ${table} SET joined_at = $2 WHERE channel_id = $1) ` +
        'SELECT user_id, joined_at FROM previous ORDER BY user_id',
      [channelId, at],
    );
  }

  /** CTE mit abschließendem SELECT, damit TypeORM bei DELETE und UPDATE Zeilen statt [rows, count] liefert. */
  private query<T>(
    sql: (table: string) => string,
    params: ReadonlyArray<unknown>,
  ): Promise<Array<T>> {
    const repository = this.repository();
    return repository.manager.query(
      sql(quoteIdentifier(repository.metadata.tableName)),
      [...params],
    );
  }
}
