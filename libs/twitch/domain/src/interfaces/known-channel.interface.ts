import type { ChannelRef } from './channel-ref.interface.js';

export interface KnownChannel extends ChannelRef {
  readonly last_seen_at: Date;
}
