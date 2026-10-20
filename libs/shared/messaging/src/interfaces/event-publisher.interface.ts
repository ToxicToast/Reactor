import type { DomainEvent } from '@toxictoast/shared-kernel';

export interface EventPublisher {
  publish(events: ReadonlyArray<DomainEvent>): Promise<void>;
}
