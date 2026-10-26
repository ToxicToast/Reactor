import type { Nullable } from '@toxictoast/shared-types';

export interface AuditEventRow {
  event_id: string;
  event_namespace: string;
  event_name: string;
  event_version: number;
  aggregate_id: string;
  occurred_at: Date;
  actor_type: string;
  actor_id: Nullable<string>;
  actor_ip: Nullable<string>;
  correlation_id: Nullable<string>;
  payload: object;
  recorded_at: Date;
}
