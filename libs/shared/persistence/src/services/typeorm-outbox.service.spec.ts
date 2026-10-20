import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { EntityManager } from 'typeorm';
import { TransactionContext } from '../classes/index.js';
import { TypeOrmOutbox } from './typeorm-outbox.service.js';

const EVENT: DomainEvent = {
  event_id: '0192f3a0-0000-7000-8000-000000000001',
  event_namespace: 'blog.tag',
  event_name: 'create',
  event_version: 1,
  aggregate_id: 'tag-1',
  occurred_at: new Date('2026-10-19T12:00:00Z'),
  payload: { title: 'Warhammer' },
};

describe('TypeOrmOutbox', () => {
  let insert: jest.Mock;
  let manager: EntityManager;
  let context: TransactionContext;
  let outbox: TypeOrmOutbox;

  beforeEach(() => {
    insert = jest.fn();
    manager = {
      getRepository: () => ({ insert }),
    } as unknown as EntityManager;
    context = new TransactionContext();
    outbox = new TypeOrmOutbox(context);
  });

  it('inserts the events as unpublished rows', async () => {
    await context.run(manager, () => outbox.add([EVENT]));

    expect(insert).toHaveBeenCalledWith([
      { ...EVENT, published_at: null, attempts: 0 },
    ]);
  });

  it('does nothing without events', async () => {
    await outbox.add([]);

    expect(insert).not.toHaveBeenCalled();
  });

  it('refuses to write outside a unit of work', async () => {
    await expect(outbox.add([EVENT])).rejects.toThrow('UnitOfWork');
  });
});
