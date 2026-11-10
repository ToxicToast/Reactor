import type { Nullable } from '@toxictoast/shared-types';
import type { ChannelRef } from '../interfaces/index.js';
import type { SessionCounters, StreamSessionId } from '../types/index.js';

export interface StreamSessionEventPayload extends ChannelRef, SessionCounters {
  readonly id: StreamSessionId;
  readonly stream_id: string;
  readonly started_at: Date;
  readonly ended_at: Nullable<Date>;
  readonly duration_seconds: Nullable<number>;
  readonly peak_chatters: number;
  readonly unique_chatters: number;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
