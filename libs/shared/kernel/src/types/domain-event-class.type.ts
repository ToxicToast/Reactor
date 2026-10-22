import type { DomainEvent } from '../interfaces/index.js';

export type DomainEventClass<TPayload extends object> = new (
  event_id: string,
  aggregate_id: string,
  occurred_at: Date,
  payload: TPayload,
) => DomainEvent<TPayload>;
