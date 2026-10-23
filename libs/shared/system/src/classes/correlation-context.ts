import { AsyncLocalStorage } from 'node:async_hooks';
import { CorrelationProvider } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';

export class CorrelationContext extends CorrelationProvider {
  private readonly storage = new AsyncLocalStorage<string>();

  current(): Nullable<string> {
    return this.storage.getStore() ?? null;
  }

  run<T>(correlationId: string, work: () => T): T {
    return this.storage.run(correlationId, work);
  }
}
