import type { Optional } from '@toxictoast/shared-types';

export interface AuditEventView {
  readonly event_id: string;
  readonly event_namespace: string;
  readonly event_name: string;
  readonly event_version: number;
  readonly aggregate_id: string;
  readonly occurred_at: string;
  readonly actor: {
    readonly type: string;
    readonly id?: Optional<string>;
    readonly ip?: Optional<string>;
  };
  readonly correlation_id?: Optional<string>;
  readonly payload: unknown;
  readonly recorded_at: string;
}
