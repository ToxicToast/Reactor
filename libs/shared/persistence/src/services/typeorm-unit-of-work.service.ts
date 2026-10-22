import type { UnitOfWork } from '@toxictoast/shared-application';
import type { DataSource } from 'typeorm';
import type { TransactionContext } from '../classes/index.js';

export class TypeOrmUnitOfWork implements UnitOfWork {
  constructor(
    private readonly dataSource: DataSource,
    private readonly context: TransactionContext,
  ) {}

  run<T>(work: () => Promise<T>): Promise<T> {
    if (this.context.current()) {
      return work();
    }

    return this.dataSource.transaction((manager) => {
      return this.context.run(manager, work);
    });
  }
}
