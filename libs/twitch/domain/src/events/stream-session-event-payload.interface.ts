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
  readonly title: Nullable<string>;
  readonly game_id: Nullable<string>;
  readonly game_name: Nullable<string>;
  readonly viewer_count: number;
  readonly peak_viewers: number;
  readonly average_viewers: number;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
