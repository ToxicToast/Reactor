/** Source of "now"; keeps use cases deterministic in tests. */
export interface Clock {
  now(): Date;
}
