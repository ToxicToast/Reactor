export interface RecordedTwitchEvent {
  readonly event_id: string;
  readonly topic: string;
  readonly name: string;
  readonly channel_id: string;
  readonly occurred_at: Date;
  readonly payload: object;
}
