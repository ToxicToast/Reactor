import { TIME_MS } from '@toxictoast/shared-types';
import type { MetricsInterval } from '../interfaces/index.js';

/** übernommen aus dem alten Publisher: dicht am Anfang, wo sich die Zahlen bewegen, danach immer seltener */
export const METRICS_SCHEDULE: {
  readonly INTERVALS: ReadonlyArray<MetricsInterval>;
  readonly FALLBACK_INTERVAL_MS: number;
  readonly MAX_FAILURES: number;
} = {
  INTERVALS: [
    { max_age_ms: 3 * TIME_MS.HOUR, interval_ms: 15 * TIME_MS.MINUTE },
    { max_age_ms: TIME_MS.DAY, interval_ms: TIME_MS.HOUR },
    { max_age_ms: 7 * TIME_MS.DAY, interval_ms: 6 * TIME_MS.HOUR },
    { max_age_ms: 30 * TIME_MS.DAY, interval_ms: TIME_MS.DAY },
    { max_age_ms: 365 * TIME_MS.DAY, interval_ms: 7 * TIME_MS.DAY },
  ],
  /** älter als ein Jahr: monatlich */
  FALLBACK_INTERVAL_MS: 30 * TIME_MS.DAY,
  /** ein abgelaufener Token oder ein gelöschter Post heilt nicht von selbst; weiter fragen kostet nur Rate-Limit */
  MAX_FAILURES: 5,
};
