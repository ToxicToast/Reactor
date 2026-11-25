export interface DailyClicks {
  /** YYYY-MM-DD in der Stats-Zeitzone */
  readonly day: string;
  readonly clicks: number;
}
