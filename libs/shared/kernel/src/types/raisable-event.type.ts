import type { DomainEventDefinition } from '../interfaces/index.js';
import type { DomainEventClass } from './domain-event-class.type.js';

export type RaisableEvent<TAnemic extends object> =
  DomainEventClass<TAnemic> | DomainEventDefinition;
