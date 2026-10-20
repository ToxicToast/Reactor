import type { DataSource, EntityManager } from 'typeorm';
import { TransactionContext } from '../classes/index.js';
import { TypeOrmUnitOfWork } from './typeorm-unit-of-work.service.js';

describe('TypeOrmUnitOfWork', () => {
  const manager = {} as EntityManager;
  let transaction: jest.Mock;
  let context: TransactionContext;
  let uow: TypeOrmUnitOfWork;

  beforeEach(() => {
    transaction = jest.fn((work: (m: EntityManager) => Promise<unknown>) => {
      return work(manager);
    });
    context = new TransactionContext();
    uow = new TypeOrmUnitOfWork(
      { transaction } as unknown as DataSource,
      context,
    );
  });

  it('runs the work inside a transaction', async () => {
    const result = await uow.run(async () => context.current());

    expect(result).toBe(manager);
    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it('reuses the running transaction when nested', async () => {
    await uow.run(() => uow.run(async () => 'done'));

    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it('propagates errors so the transaction rolls back', async () => {
    const failing = uow.run(async () => {
      throw new Error('boom');
    });

    await expect(failing).rejects.toThrow('boom');
  });
});
