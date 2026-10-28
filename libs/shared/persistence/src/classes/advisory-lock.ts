import type { DataSource, EntityManager } from 'typeorm';
import { TransactionContext } from './transaction-context.js';

export class AdvisoryLock {
  constructor(
    private readonly dataSource: DataSource,
    private readonly context: TransactionContext = new TransactionContext(),
  ) {}

  runExclusive<T>(
    name: string,
    work: (manager: EntityManager) => Promise<T>,
    busy: T,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const rows: Array<{ locked: boolean }> = await manager.query(
        'SELECT pg_try_advisory_xact_lock(hashtext($1)) AS locked',
        [name],
      );
      if (!rows[0]?.locked) {
        return busy;
      }
      return this.context.run(manager, () => work(manager));
    });
  }
}
