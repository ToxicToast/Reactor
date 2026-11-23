import type { ChannelRef, StreamStatus } from '@toxictoast/twitch-domain';

export interface StreamStatusChange {
  readonly channel: ChannelRef;
  readonly stream_id: string;
  readonly status: StreamStatus;
}
