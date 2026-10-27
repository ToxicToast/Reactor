import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { TwitchChannelAnemic } from '../anemics/index.js';

export class RevokeChannelEvent implements DomainEvent<TwitchChannelAnemic> {
  readonly event_namespace = 'twitch.bot';
  readonly event_name = 'channel_revoked';
  readonly event_version = 1;

  constructor(
    readonly event_id: string,
    readonly aggregate_id: string,
    readonly occurred_at: Date,
    readonly payload: TwitchChannelAnemic,
  ) {}
}
