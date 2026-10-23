import type { ActorType } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';

export interface OutboxRow {
  event_id: string;
  event_namespace: string;
  event_name: string;
  event_version: number;
  aggregate_id: string;
  actor_type: ActorType;
  actor_id: Nullable<string>;
  actor_ip: Nullable<string>;
  correlation_id: Nullable<string>;
  payload: object;
  occurred_at: Date;
  published_at: Nullable<Date>;
  attempts: number;
}
