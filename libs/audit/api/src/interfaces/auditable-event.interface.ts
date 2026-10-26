export interface AuditableEvent {
  readonly event_id: string;
  readonly event_namespace: string;
  readonly event_name: string;
  readonly event_version: number;
  readonly aggregate_id: string;
  readonly occurred_at: string;
  readonly actor?: unknown;
  readonly correlation_id?: unknown;
  readonly payload: object;
}
