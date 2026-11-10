/** Der Teil eines konsumierten Kafka-Events, den der twitch-service braucht. */
export interface IncomingTwitchEvent {
  readonly event_id: string;
  readonly event_namespace: string;
  readonly event_name: string;
  readonly occurred_at: string;
  readonly payload: unknown;
}
