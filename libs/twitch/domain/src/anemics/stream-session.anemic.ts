import type { Anemic } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { ChannelRef } from '../interfaces/index.js';
import type { SessionCounters, StreamSessionId } from '../types/index.js';

export interface StreamSessionAnemic
  extends Anemic<StreamSessionId>, ChannelRef, SessionCounters {
  readonly stream_id: string;
  readonly started_at: Date;
  readonly ended_at: Nullable<Date>;
  readonly duration_seconds: Nullable<number>;
  readonly peak_chatters: number;
  readonly unique_chatters: number;
}
