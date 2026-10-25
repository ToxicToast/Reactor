import type { Nullable } from '@toxictoast/shared-types';
import type { EventActorV1 } from './event-actor.interface.js';

export interface EventEnvelope<
  TNamespace extends string,
  TName extends string,
  TPayload extends object,
> {
  readonly event_id: string;
  readonly event_namespace: TNamespace;
  readonly event_name: TName;
  readonly event_version: number;
  readonly aggregate_id: string;
  readonly occurred_at: string;
  readonly actor: EventActorV1;
  readonly correlation_id: Nullable<string>;
  readonly payload: TPayload;
}
