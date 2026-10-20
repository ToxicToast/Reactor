import type { Anemic, Nullable, Optional } from '@toxictoast/shared-kernel';
import type {
  DataSource,
  EntitySchema,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import type { TransactionContext } from '../classes/index.js';
import type { Mapper } from '../interfaces/index.js';

export abstract class TypeOrmRepository<
  TAnemic extends Anemic,
  TRow extends ObjectLiteral,
> {
  protected constructor(
    private readonly dataSource: DataSource,
    private readonly context: TransactionContext,
    private readonly schema: EntitySchema<TRow>,
    protected readonly mapper: Mapper<TAnemic, TRow>,
  ) {}

  async save(anemic: TAnemic): Promise<TAnemic> {
    const row = await this.repository().save(this.mapper.toRow(anemic));
    return this.mapper.toAnemic(row);
  }

  findById(id: TAnemic['id'], withDeleted = false): Promise<Nullable<TAnemic>> {
    return this.one(this.query(withDeleted).andWhere('e.id = :id', { id }));
  }

  findList(
    limit?: Optional<number>,
    offset?: Optional<number>,
    withDeleted = false,
  ): Promise<Array<TAnemic>> {
    return this.many(
      this.query(withDeleted)
        .orderBy('e.created_at', 'DESC')
        .take(limit)
        .skip(offset),
    );
  }

  protected repository(): Repository<TRow> {
    return this.context.manager(this.dataSource).getRepository(this.schema);
  }

  protected query(withDeleted = false): SelectQueryBuilder<TRow> {
    const query = this.repository().createQueryBuilder('e');
    if (!withDeleted) {
      query.andWhere('e.deleted_at IS NULL');
    }
    return query;
  }

  protected async one(
    query: SelectQueryBuilder<TRow>,
  ): Promise<Nullable<TAnemic>> {
    const row = await query.getOne();
    if (!row) {
      return null;
    }
    return this.mapper.toAnemic(row);
  }

  protected async many(
    query: SelectQueryBuilder<TRow>,
  ): Promise<Array<TAnemic>> {
    const rows = await query.getMany();
    return rows.map((row) => this.mapper.toAnemic(row));
  }
}
