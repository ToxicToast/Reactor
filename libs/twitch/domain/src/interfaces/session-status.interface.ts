import type { Nullable } from '@toxictoast/shared-types';

export interface SessionStatus {
  readonly title: Nullable<string>;
  readonly game_id: Nullable<string>;
  readonly game_name: Nullable<string>;
  readonly viewer_count: number;
  readonly peak_viewers: number;
  /** Anzahl Messungen und ihre Summe, daraus ergibt sich der Durchschnitt */
  readonly viewer_samples: number;
  readonly viewer_sum: number;
}
