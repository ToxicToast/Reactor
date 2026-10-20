import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { Actor } from '@toxictoast/shared-system';

export interface PublishedEvent extends DomainEvent {
  readonly actor: Actor;
}
