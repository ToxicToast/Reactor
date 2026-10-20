import { AsyncLocalStorage } from 'node:async_hooks';
import type { Optional } from '@toxictoast/shared-kernel';
import type { DataSource, EntityManager } from 'typeorm';

export class TransactionContext {
  private readonly storage = new AsyncLocalStorage<EntityManager>();

  current(): Optional<EntityManager> {
    return this.storage.getStore();
  }

  run<T>(manager: EntityManager, work: () => Promise<T>): Promise<T> {
    return this.storage.run(manager, work);
  }

  manager(dataSource: DataSource): EntityManager {
    return this.current() ?? dataSource.manager;
  }
}
