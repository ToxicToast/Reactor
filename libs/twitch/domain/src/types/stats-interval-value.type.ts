import type { StatsIntervals } from '../constants/index.js';

export type StatsIntervalValue =
  (typeof StatsIntervals)[keyof typeof StatsIntervals];
