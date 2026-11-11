import { createFixedTestContext } from '../testing/index.js';
import { defineDomainEvents } from '../functions/index.js';
import type { Anemic } from '../interfaces/index.js';
import type { Id, Mutable } from '../types/index.js';
import { BaseDomain } from './base-domain.abstract.js';

const NOW = new Date('2026-11-10T12:00:00Z');

const ThingEvents = defineDomainEvents('test.thing', 3, {
  CREATED: 'created',
  DELETED: 'deleted',
});

interface ThingAnemic extends Anemic<Id<'Thing'>> {
  readonly title: string;
  readonly secret: string;
}

interface ThingPayload {
  readonly id: string;
  readonly title: string;
}

const anemic = (): Mutable<ThingAnemic> => {
  return {
    id: 'thing-1' as Id<'Thing'>,
    title: 'Thing',
    secret: 'internal',
    created_at: NOW,
    updated_at: null,
    deleted_at: null,
  };
};

class Thing extends BaseDomain<ThingAnemic, ThingPayload> {
  create(): void {
    this.raise(ThingEvents.CREATED);
  }

  remove(): void {
    this.markDeleted(ThingEvents.DELETED);
  }

  protected override toEventPayload(): ThingPayload {
    return { id: this.state.id, title: this.state.title };
  }
}

class Silent extends BaseDomain<ThingAnemic> {
  create(): void {
    this.raise(ThingEvents.CREATED);
  }
}

describe('BaseDomain', () => {
  const ctx = createFixedTestContext('event-1', () => NOW);

  it('raises events from the definition with the mapped payload', () => {
    const thing = new Thing(anemic(), ctx);

    thing.create();

    expect(thing.toEvents()).toEqual([
      {
        event_id: 'event-1',
        event_namespace: 'test.thing',
        event_name: 'created',
        event_version: 3,
        aggregate_id: 'thing-1',
        occurred_at: NOW,
        payload: { id: 'thing-1', title: 'Thing' },
      },
    ]);
  });

  it('marks the aggregate deleted only once', () => {
    const thing = new Thing(anemic(), ctx);

    thing.remove();
    thing.remove();

    expect(thing.toAnemic().deleted_at).toEqual(NOW);
    expect(thing.toEvents().map((event) => event.event_name)).toEqual([
      'deleted',
    ]);
  });

  it('refuses to raise events without a payload mapping', () => {
    const silent = new Silent(anemic(), ctx);

    expect(() => silent.create()).toThrow(
      'Silent raises events but defines no event payload',
    );
  });
});
