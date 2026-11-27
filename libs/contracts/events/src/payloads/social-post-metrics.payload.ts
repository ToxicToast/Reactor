import type { Nullable } from '@toxictoast/shared-types';

/** null heißt: die Plattform kennt die Kennzahl nicht; 0 heißt: gemessen und null */
export interface SocialPostMetricsV1 {
  readonly views: Nullable<number>;
  readonly likes: Nullable<number>;
  readonly comments: Nullable<number>;
  readonly shares: Nullable<number>;
  readonly saves: Nullable<number>;
  readonly reach: Nullable<number>;
  /** durchschnittliche Wiedergabedauer pro Aufruf */
  readonly avg_watch_time_ms: Nullable<number>;
  /** gesamte Abspielzeit inklusive Wiederholungen */
  readonly total_watch_time_ms: Nullable<number>;
  /** 0–100 */
  readonly avg_view_percentage: Nullable<number>;
  readonly followers_gained: Nullable<number>;
}
