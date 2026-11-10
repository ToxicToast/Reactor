export const zeroCounters = <K extends string>(
  keys: ReadonlyArray<K>,
): Record<K, number> => {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>;
};
