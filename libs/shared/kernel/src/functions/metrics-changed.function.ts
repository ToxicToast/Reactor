import type { Nullable } from '@toxictoast/shared-types';
import type { MetricValues } from '../types/index.js';

/** ohne vorherigen Stand gilt alles als geändert; sonst reicht eine abweichende Kennzahl */
export const metricsChanged = <K extends string>(
  previous: Nullable<MetricValues<K>>,
  next: MetricValues<K>,
  keys: ReadonlyArray<K>,
): boolean => {
  if (previous === null) {
    return true;
  }
  return keys.some((key) => {
    return previous[key] !== next[key];
  });
};
