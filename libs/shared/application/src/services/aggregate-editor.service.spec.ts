import {
  type Anemic,
  type DomainEvent,
  type Id,
  NotFoundError,
  type Repository,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import { INCLUDING_DELETED } from '../constants/index.js';
import { ImmediateUnitOfWork, InMemoryOutbox } from '../testing/index.js';
import { AggregateEditor } from './aggregate-editor.service.js';
import { DomainPersistence } from './domain-persistence.service.js';

const NOW = new Date('2026-11-06T12:00:00Z');
const ID = 'id-1' as Id<'Test'>;

const anemic: Anemic = {
  id: ID,
  created_at: NOW,
  updated_at: null,
  deleted_at: null,
};

const event: DomainEvent = {
  event_id: 'event-1',
  event_namespace: 'test',
  event_name: 'touched',
  event_version: 1,
  aggregate_id: ID,
  occurred_at: NOW,
  payload: anemic,
};

const domainFor = (source: Anemic) => {
  const events: Array<DomainEvent> = [];
  return {
    touch: (): void => {
      events.push(event);
    },
    toAnemic: (): Anemic => source,
    toEvents: (): Array<DomainEvent> => events,
  };
};

describe('AggregateEditor', () => {
  let stored: Nullable<Anemic>;
  let saved: Array<Anemic>;
  let lookups: Array<Optional<boolean>>;
  let outbox: InMemoryOutbox;
  let editor: AggregateEditor<Anemic, ReturnType<typeof domainFor>>;

  beforeEach(() => {
    stored = anemic;
    saved = [];
    lookups = [];
    outbox = new InMemoryOutbox();
    const repository: Repository<Anemic> = {
      save: async (item) => {
        saved.push(item);
        return item;
      },
      findList: async () => [],
      findById: async (_id, withDeleted) => {
        lookups.push(withDeleted);
        return stored;
      },
    };
    editor = new AggregateEditor(
      'Test',
      { reconstitute: domainFor },
      repository,
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
    );
  });

  it('fails with not found when the aggregate does not exist', async () => {
    stored = null;

    const result = await editor.change(ID, (domain) => domain.touch());

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('applies the change and persists aggregate and events', async () => {
    const result = await editor.change(ID, (domain) => domain.touch());

    expect(result.isSuccess).toBe(true);
    expect(saved).toEqual([anemic]);
    expect(outbox.events).toEqual([event]);
  });

  it('returns the failure of the change without persisting', async () => {
    const result = await editor.change(ID, () =>
      Result.fail(new ValidationError('invalid')),
    );

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(saved).toHaveLength(0);
  });

  it('supports asynchronous changes', async () => {
    const result = await editor.change(ID, async (domain) => {
      await Promise.resolve();
      domain.touch();
      return Result.ok();
    });

    expect(result.isSuccess).toBe(true);
    expect(saved).toEqual([anemic]);
  });

  it('loads deleted aggregates only when asked to', async () => {
    await editor.change(ID, (domain) => domain.touch());
    await editor.change(ID, (domain) => domain.touch(), INCLUDING_DELETED);

    expect(lookups).toEqual([undefined, true]);
  });
});
