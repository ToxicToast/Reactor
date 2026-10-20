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
  readonly payload: TPayload;
}
