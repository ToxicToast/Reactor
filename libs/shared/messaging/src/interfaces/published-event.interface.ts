import type { ActorIdentity, DomainEvent } from '@toxictoast/shared-kernel';

export interface PublishedEvent extends DomainEvent {
  readonly actor: ActorIdentity;
}
