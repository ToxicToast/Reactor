import type { DomainEvent } from '@toxictoast/shared-kernel';

export interface Outbox {
  add(events: ReadonlyArray<DomainEvent>): Promise<void>;
}
