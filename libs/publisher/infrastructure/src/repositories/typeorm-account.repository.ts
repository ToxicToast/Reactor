import type {
  Account,
  AccountRef,
  AccountRepository,
} from '@toxictoast/publisher-domain';
import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import type { DataSource } from 'typeorm';
import { REF_COLUMNS } from '../constants/index.js';
import { AccountSchema } from '../schemas/index.js';

export class TypeOrmAccountRepository
  extends TypeOrmTableRepository<Account>
  implements AccountRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, AccountSchema);
  }

  async save(account: Account): Promise<void> {
    await this.repository().upsert(account, [...REF_COLUMNS]);
  }

  find(ref: AccountRef): Promise<Nullable<Account>> {
    return this.repository().findOneBy({
      platform: ref.platform,
      remote_id: ref.remote_id,
    });
  }

  list(): Promise<Array<Account>> {
    return this.repository().find({
      order: { platform: 'ASC', handle: 'ASC' },
    });
  }
}
