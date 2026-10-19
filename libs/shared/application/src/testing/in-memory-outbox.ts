import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { Outbox } from '../interfaces/index.js';

export class InMemoryOutbox implements Outbox {
  readonly events: Array<DomainEvent> = [];

  async add(events: ReadonlyArray<DomainEvent>): Promise<void> {
    this.events.push(...events);
  }
}
