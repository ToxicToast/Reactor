import { z } from 'zod';

export const enumQuery = <K extends string, V>(
  values: Readonly<Record<K, V>>,
) => {
  const keys = Object.keys(values) as [K, ...Array<K>];
  return z.enum(keys).transform((key) => values[key]);
};
