import type { DomainEventDefinition } from './domain-event-definition.interface.js';

export interface ConnectedAccountEvents {
  readonly CONNECTED: DomainEventDefinition;
  readonly DISCONNECTED: DomainEventDefinition;
  readonly REVOKED: DomainEventDefinition;
}
