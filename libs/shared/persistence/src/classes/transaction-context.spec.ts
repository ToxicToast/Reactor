import type { EntityManager } from 'typeorm';
import { TransactionContext } from './transaction-context.js';

describe('TransactionContext', () => {
  const manager = {} as EntityManager;

  it('is empty outside of run', () => {
    const context = new TransactionContext();

    expect(context.current()).toBeUndefined();
  });

  it('provides the manager inside run, also after await', async () => {
    const context = new TransactionContext();

    const result = await context.run(manager, async () => {
      await Promise.resolve();
      return context.current();
    });

    expect(result).toBe(manager);
    expect(context.current()).toBeUndefined();
  });
});
