import type { EntitySchemaColumnOptions } from 'typeorm';

export const counterColumns = <K extends string>(
  keys: ReadonlyArray<K>,
): Record<K, EntitySchemaColumnOptions> => {
  return Object.fromEntries(
    keys.map((key) => [key, { type: 'int', default: 0 }]),
  ) as Record<K, EntitySchemaColumnOptions>;
};
