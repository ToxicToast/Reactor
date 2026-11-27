import type { Nullable } from '@toxictoast/shared-types';

/** nur aus der Analytics API; kommt mit zwei bis drei Tagen Versatz */
export interface YouTubeVideoAnalytics {
  readonly avg_watch_time_ms: Nullable<number>;
  readonly total_watch_time_ms: Nullable<number>;
  readonly avg_view_percentage: Nullable<number>;
  readonly shares: Nullable<number>;
  /** netto: gewonnen minus verloren */
  readonly followers_gained: Nullable<number>;
}
