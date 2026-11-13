import type { Anemic, DomainEvent, Id } from '@toxictoast/shared-kernel';
import type { SaveRepository } from '../interfaces/index.js';
import { ImmediateUnitOfWork, InMemoryOutbox } from '../testing/index.js';
import { DomainPersistence } from './domain-persistence.service.js';

const NOW = new Date('2026-11-13T12:00:00Z');

const anemic: Anemic = {
  id: 'id-1' as Id<'Test'>,
  created_at: NOW,
  updated_at: null,
  deleted_at: null,
};

const event: DomainEvent = {
  event_id: 'event-1',
  event_namespace: 'test',
  event_name: 'touched',
  event_version: 1,
  aggregate_id: anemic.id,
  occurred_at: NOW,
  payload: anemic,
};

const domainWith = (events: Array<DomainEvent>) => {
  return {
    toAnemic: (): Anemic => anemic,
    toEvents: (): Array<DomainEvent> => events,
  };
};

describe('DomainPersistence.save', () => {
  let saved: Array<Anemic>;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let persistence: DomainPersistence;
  let repository: SaveRepository<Anemic>;

  beforeEach(() => {
    saved = [];
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    persistence = new DomainPersistence(outbox, uow);
    repository = {
      save: async (item) => {
        saved.push(item);
        return item;
      },
    };
  });

  it('saves without events and without a unit of work', async () => {
    const result = await persistence.save(domainWith([]), repository);

    expect(result).toBe(anemic);
    expect(saved).toEqual([anemic]);
    expect(outbox.events).toHaveLength(0);
    expect(uow.runs).toBe(0);
  });

  it('saves and writes the events inside a unit of work', async () => {
    await persistence.save(domainWith([event]), repository);

    expect(saved).toEqual([anemic]);
    expect(outbox.events).toEqual([event]);
    expect(uow.runs).toBe(1);
  });
});
