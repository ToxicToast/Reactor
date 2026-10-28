import type { PollSnapshot } from './poll-snapshot.interface.js';

export interface StoredPoll extends PollSnapshot {
  readonly channel_id: string;
}
