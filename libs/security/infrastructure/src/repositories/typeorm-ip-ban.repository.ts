import type { IpBanAnemic, IpBanRepository } from '@toxictoast/security-domain';
import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { DataSource, SelectQueryBuilder } from 'typeorm';
import type { IpBanRow } from '../interfaces/index.js';
import { IpBanMapper } from '../mappers/index.js';
import { IpBanSchema } from '../schemas/index.js';

export class TypeOrmIpBanRepository
  extends TypeOrmRepository<IpBanAnemic, IpBanRow>
  implements IpBanRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, IpBanSchema, new IpBanMapper());
  }

  findActiveByIp(ip: string, now: Date): Promise<Nullable<IpBanAnemic>> {
    return this.one(
      this.active(now)
        .andWhere('e.ip = :ip', { ip })
        .orderBy('e.banned_until', 'DESC'),
    );
  }

  findActive(
    now: Date,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<IpBanAnemic>> {
    return this.many(
      this.active(now).orderBy('e.created_at', 'DESC').take(limit).skip(offset),
    );
  }

  countSince(ip: string, since: Date): Promise<number> {
    return this.query()
      .andWhere('e.ip = :ip', { ip })
      .andWhere('e.created_at >= :since', { since })
      .getCount();
  }

  private active(now: Date): SelectQueryBuilder<IpBanRow> {
    return this.query()
      .andWhere('e.lifted_at IS NULL')
      .andWhere('e.banned_until > :now', { now });
  }
}
