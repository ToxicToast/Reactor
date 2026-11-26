import type { Nullable } from '@toxictoast/shared-types';

/** ein Messwert je Kennzahl; null, wenn die Plattform sie nicht liefert */
export type MetricValues<K extends string> = Readonly<
  Record<K, Nullable<number>>
>;
