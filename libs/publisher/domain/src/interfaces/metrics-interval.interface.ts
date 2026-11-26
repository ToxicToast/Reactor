export interface MetricsInterval {
  /** gilt für Posts, die jünger sind als dieser Wert */
  readonly max_age_ms: number;
  readonly interval_ms: number;
}
