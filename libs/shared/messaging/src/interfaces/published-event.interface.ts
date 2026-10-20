import type { Actor, DomainEvent } from '@toxictoast/shared-kernel';

export interface PublishedEvent extends DomainEvent {
  readonly actor: Actor;
}
