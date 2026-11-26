import type {
  AccountRef,
  AccountSnapshot,
  AccountSnapshotRepository,
} from '@toxictoast/publisher-domain';
import type { TransactionContext } from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import type { DataSource } from 'typeorm';
import { TypeOrmSnapshotRepository } from '../abstracts/index.js';
import type { AccountSnapshotRow } from '../interfaces/index.js';
import { AccountSnapshotMapper } from '../mappers/index.js';
import { AccountSnapshotSchema } from '../schemas/index.js';

export class TypeOrmAccountSnapshotRepository
  extends TypeOrmSnapshotRepository<AccountSnapshotRow>
  implements AccountSnapshotRepository
{
  private readonly mapper = new AccountSnapshotMapper();

  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, AccountSnapshotSchema);
  }

  async latest(account: AccountRef): Promise<Nullable<AccountSnapshot>> {
    const row = await this.latestRow(account);
    return row ? this.mapper.toSnapshot(row) : null;
  }

  record(snapshot: AccountSnapshot): Promise<void> {
    return this.insertRow(this.mapper.toRow(snapshot));
  }
}
