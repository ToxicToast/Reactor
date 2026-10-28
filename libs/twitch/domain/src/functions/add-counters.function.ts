export const addCounters = <K extends string>(
  keys: ReadonlyArray<K>,
  base: Readonly<Record<K, number>>,
  deltas: Partial<Readonly<Record<K, number>>>,
): Record<K, number> => {
  return Object.fromEntries(
    keys.map((key) => [key, base[key] + (deltas[key] ?? 0)]),
  ) as Record<K, number>;
};
