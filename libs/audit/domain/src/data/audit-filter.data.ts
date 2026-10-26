import type { Optional } from '@toxictoast/shared-types';

export interface AuditFilter {
  readonly correlation_id?: Optional<string>;
  readonly actor_id?: Optional<string>;
  readonly actor_type?: Optional<string>;
  readonly aggregate_id?: Optional<string>;
  readonly event_namespace?: Optional<string>;
  readonly from?: Optional<Date>;
  readonly to?: Optional<Date>;
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
}
