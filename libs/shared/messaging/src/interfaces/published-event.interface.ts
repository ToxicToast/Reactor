import type { ActorIdentity, DomainEvent } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';

export interface PublishedEvent extends DomainEvent {
  readonly actor: ActorIdentity;
  readonly correlation_id: Nullable<string>;
}
