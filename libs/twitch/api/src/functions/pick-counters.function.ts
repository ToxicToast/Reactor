export const pickCounters = <K extends string>(
  keys: ReadonlyArray<K>,
  source: Readonly<Record<K, number>>,
): Record<K, number> => {
  return Object.fromEntries(keys.map((key) => [key, source[key]])) as Record<
    K,
    number
  >;
};
