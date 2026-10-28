import type { ViewerRef } from './viewer-ref.interface.js';

export interface LeaderboardEntry extends ViewerRef {
  readonly value: number;
}
