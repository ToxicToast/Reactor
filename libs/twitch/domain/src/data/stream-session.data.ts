import type { ChannelRef } from '../interfaces/index.js';

export interface StreamSessionData {
  readonly channel: ChannelRef;
  readonly stream_id: string;
  readonly started_at: Date;
}
