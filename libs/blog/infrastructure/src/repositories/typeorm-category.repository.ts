import type {
  CategoryAnemic,
  CategoryId,
  CategoryRepository,
} from '@toxictoast/blog-domain';
import type { Nullable } from '@toxictoast/shared-types';
import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { DataSource } from 'typeorm';
import type { CategoryRow } from '../interfaces/index.js';
import { CategoryMapper } from '../mappers/index.js';
import { CategorySchema } from '../schemas/index.js';

export class TypeOrmCategoryRepository
  extends TypeOrmRepository<CategoryAnemic, CategoryRow>
  implements CategoryRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, CategorySchema, new CategoryMapper());
  }

  findBySlug(
    slug: string,
    withDeleted = false,
  ): Promise<Nullable<CategoryAnemic>> {
    return this.one(
      this.query(withDeleted).andWhere('e.slug = :slug', { slug }),
    );
  }

  async findByIds(
    ids: ReadonlyArray<CategoryId>,
  ): Promise<Array<CategoryAnemic>> {
    if (ids.length === 0) {
      return [];
    }
    return this.many(this.query().andWhere('e.id IN (:...ids)', { ids }));
  }

  findChildren(parentId: CategoryId): Promise<Array<CategoryAnemic>> {
    return this.many(
      this.query().andWhere('e.parent_id = :parentId', { parentId }),
    );
  }
}
