import type { DomainEvent } from '@toxictoast/shared-kernel';
import { ActorContext, ActorType, type Actor } from '@toxictoast/shared-system';
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

const USER: Actor = { type: ActorType.USER, id: 'user-1', ip: '203.0.113.7' };

describe('TypeOrmOutbox', () => {
  let insert: jest.Mock;
  let manager: EntityManager;
  let context: TransactionContext;
  let actors: ActorContext;
  let outbox: TypeOrmOutbox;

  beforeEach(() => {
    insert = jest.fn();
    manager = {
      getRepository: () => ({ insert }),
    } as unknown as EntityManager;
    context = new TransactionContext();
    actors = new ActorContext();
    outbox = new TypeOrmOutbox(context, actors);
  });

  it('inserts the events as unpublished rows with the current actor', async () => {
    await actors.run(USER, () =>
      context.run(manager, () => outbox.add([EVENT])),
    );

    expect(insert).toHaveBeenCalledWith([
      {
        ...EVENT,
        actor_type: 'user',
        actor_id: 'user-1',
        actor_ip: '203.0.113.7',
        published_at: null,
        attempts: 0,
      },
    ]);
  });

  it('uses the system actor outside of a request', async () => {
    await context.run(manager, () => outbox.add([EVENT]));

    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        actor_type: 'system',
        actor_id: null,
        actor_ip: null,
      }),
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
