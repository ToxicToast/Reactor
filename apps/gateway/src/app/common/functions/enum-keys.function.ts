export const enumKeys = <K extends string>(
  values: Readonly<Record<K, unknown>>,
): [K, ...Array<K>] => {
  return Object.keys(values) as [K, ...Array<K>];
};
