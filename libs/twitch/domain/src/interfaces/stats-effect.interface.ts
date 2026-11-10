import type { SessionCounters, ViewerCounters } from '../types/index.js';

export interface StatsEffect {
  readonly counters: Partial<SessionCounters>;
  readonly viewer: Partial<ViewerCounters>;
  readonly counts_as_chatter: boolean;
}
