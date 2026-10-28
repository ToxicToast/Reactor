import type { Nullable } from '@toxictoast/shared-types';
import type { ObservationKindValue } from '../types/index.js';
import type { ChannelRef } from './channel-ref.interface.js';
import type { PollSnapshot } from './poll-snapshot.interface.js';
import type { RewardRef } from './reward-ref.interface.js';
import type { ViewerRef } from './viewer-ref.interface.js';

export interface TwitchObservation {
  readonly event_id: string;
  readonly kind: ObservationKindValue;
  readonly channel: ChannelRef;
  readonly occurred_at: Date;
  readonly user: Nullable<ViewerRef>;
  readonly amount: number;
  readonly gifted: boolean;
  readonly reward: Nullable<RewardRef>;
  readonly poll: Nullable<PollSnapshot>;
  readonly stream_id: Nullable<string>;
}
