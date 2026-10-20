import type { TagAnemic, TagId, TagRepository } from '@toxictoast/blog-domain';
import type { Nullable } from '@toxictoast/shared-kernel';
import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { DataSource } from 'typeorm';
import type { TagRow } from '../interfaces/index.js';
import { TagMapper } from '../mappers/index.js';
import { TagSchema } from '../schemas/index.js';

export class TypeOrmTagRepository
  extends TypeOrmRepository<TagAnemic, TagRow>
  implements TagRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TagSchema, new TagMapper());
  }

  findBySlug(slug: string, withDeleted = false): Promise<Nullable<TagAnemic>> {
    return this.one(
      this.query(withDeleted).andWhere('e.slug = :slug', { slug }),
    );
  }

  async findByIds(ids: ReadonlyArray<TagId>): Promise<Array<TagAnemic>> {
    if (ids.length === 0) {
      return [];
    }
    return this.many(this.query().andWhere('e.id IN (:...ids)', { ids }));
  }
}
