import { Optional } from '@toxictoast/shared-types';

export interface ConsumedEvent {
  readonly event_id: string;
  readonly event_namespace: string;
  readonly event_name: string;
  readonly event_version: number;
  readonly aggregate_id: string;
  readonly occurred_at: string;
  readonly actor?: Optional<unknown>;
  readonly payload: unknown;
}
