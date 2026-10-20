import type {
  MediaAnemic,
  MediaId,
  MediaRepository,
  MediaStatus,
} from '@toxictoast/blog-domain';
import type { Optional } from '@toxictoast/shared-kernel';
import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { DataSource } from 'typeorm';
import type { MediaRow } from '../interfaces/index.js';
import { MediaMapper } from '../mappers/index.js';
import { MediaSchema } from '../schemas/index.js';

export class TypeOrmMediaRepository
  extends TypeOrmRepository<MediaAnemic, MediaRow>
  implements MediaRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, MediaSchema, new MediaMapper());
  }

  async findByIds(ids: ReadonlyArray<MediaId>): Promise<Array<MediaAnemic>> {
    if (ids.length === 0) {
      return [];
    }
    return this.many(this.query().andWhere('e.id IN (:...ids)', { ids }));
  }

  findByStatus(
    status: MediaStatus,
    olderThan?: Optional<Date>,
  ): Promise<Array<MediaAnemic>> {
    const query = this.query().andWhere('e.status = :status', { status });
    if (olderThan) {
      query.andWhere('e.created_at < :olderThan', { olderThan });
    }
    return this.many(query);
  }
}
