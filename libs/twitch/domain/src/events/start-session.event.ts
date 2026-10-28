import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { StreamSessionAnemic } from '../anemics/index.js';

export class StartSessionEvent implements DomainEvent<StreamSessionAnemic> {
  readonly event_namespace = 'twitch.session';
  readonly event_name = 'started';
  readonly event_version = 1;

  constructor(
    readonly event_id: string,
    readonly aggregate_id: string,
    readonly occurred_at: Date,
    readonly payload: StreamSessionAnemic,
  ) {}
}
