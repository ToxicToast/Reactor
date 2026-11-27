import type { DomainEvent } from '@toxictoast/shared-kernel';

/** eine Beobachtung von außen, nicht von einem Aggregat ausgelöst; landet wie jedes Event über die Outbox */
export class ObservedEvent<
  TPayload extends object = object,
> implements DomainEvent<TPayload> {
  readonly event_version = 1;

  constructor(
    readonly event_id: string,
    readonly event_namespace: string,
    readonly event_name: string,
    readonly aggregate_id: string,
    readonly occurred_at: Date,
    readonly payload: TPayload,
  ) {}
}
