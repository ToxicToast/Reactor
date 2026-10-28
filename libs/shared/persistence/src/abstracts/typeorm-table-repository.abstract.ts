import type {
  DataSource,
  EntitySchema,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import type { TransactionContext } from '../classes/index.js';

export abstract class TypeOrmTableRepository<TRow extends ObjectLiteral> {
  protected constructor(
    private readonly dataSource: DataSource,
    private readonly context: TransactionContext,
    private readonly schema: EntitySchema<TRow>,
  ) {}

  protected repository(): Repository<TRow> {
    return this.repositoryOf(this.schema);
  }

  protected repositoryOf<T extends ObjectLiteral>(
    schema: EntitySchema<T>,
  ): Repository<T> {
    return this.context.manager(this.dataSource).getRepository(schema);
  }
}
