export interface WebhookEvent {
  readonly event_id: string;
  readonly event_key: string;
  readonly occurred_at: Date;
  readonly payload: object;
}
