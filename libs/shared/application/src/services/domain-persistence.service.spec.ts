import type { Anemic, DomainEvent, Id } from '@toxictoast/shared-kernel';
import { ImmediateUnitOfWork, InMemoryOutbox } from '../testing/index.js';
import type { PersistableDomain, SaveRepository } from '../interfaces/index.js';
import { DomainPersistence } from './domain-persistence.service.js';

const NOW = new Date('2026-10-19T12:00:00Z');

const anemic: Anemic = {
  id: 'id-1' as Id<'Test'>,
  created_at: NOW,
  updated_at: null,
  deleted_at: null,
};

const event: DomainEvent = {
  event_id: 'event-1',
  event_namespace: 'test',
  event_name: 'create',
  event_version: 1,
  aggregate_id: 'id-1',
  occurred_at: NOW,
  payload: anemic,
};

const domainWith = (events: Array<DomainEvent>): PersistableDomain<Anemic> => {
  return {
    toAnemic: () => anemic,
    toEvents: () => events,
  };
};

describe('DomainPersistence', () => {
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let saved: Array<Anemic>;
  let repository: SaveRepository<Anemic>;
  let persistence: DomainPersistence;

  beforeEach(() => {
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    saved = [];
    repository = {
      save: async (item) => {
        saved.push(item);
        return item;
      },
    };
    persistence = new DomainPersistence(outbox, uow);
  });

  it('saves the anemic and writes the events inside the unit of work', async () => {
    const result = await persistence.persist(domainWith([event]), repository);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(anemic);
    expect(saved).toEqual([anemic]);
    expect(outbox.events).toEqual([event]);
    expect(uow.runs).toBe(1);
  });

  it('does nothing when there are no events', async () => {
    const result = await persistence.persist(domainWith([]), repository);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(anemic);
    expect(saved).toHaveLength(0);
    expect(outbox.events).toHaveLength(0);
    expect(uow.runs).toBe(0);
  });

  it('writes additional events after the domain events', async () => {
    const additional: DomainEvent = {
      ...event,
      event_id: 'event-2',
      event_namespace: 'moderation',
      event_name: 'requested',
    };

    await persistence.persist(domainWith([event]), repository, [additional]);

    expect(outbox.events).toEqual([event, additional]);
    expect(uow.runs).toBe(1);
  });

  it('ignores additional events when the domain did not change', async () => {
    await persistence.persist(domainWith([]), repository, [event]);

    expect(outbox.events).toHaveLength(0);
    expect(uow.runs).toBe(0);
  });
});
