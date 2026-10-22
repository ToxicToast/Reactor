export interface DomainEvent<TPayload extends object = object> {
  readonly event_id: string;
  readonly event_namespace: string;
  readonly event_name: string;
  readonly event_version: number;
  readonly aggregate_id: string;
  readonly occurred_at: Date;
  readonly payload: TPayload;
}
