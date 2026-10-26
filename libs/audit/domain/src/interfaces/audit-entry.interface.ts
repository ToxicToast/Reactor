import type { Nullable } from '@toxictoast/shared-types';

export interface AuditEntry {
  readonly event_id: string;
  readonly event_namespace: string;
  readonly event_name: string;
  readonly event_version: number;
  readonly aggregate_id: string;
  readonly occurred_at: Date;
  readonly actor_type: string;
  readonly actor_id: Nullable<string>;
  readonly actor_ip: Nullable<string>;
  readonly correlation_id: Nullable<string>;
  readonly payload: object;
  readonly recorded_at: Date;
}
