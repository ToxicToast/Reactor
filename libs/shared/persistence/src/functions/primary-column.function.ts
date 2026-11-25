import type { EntitySchemaColumnOptions } from 'typeorm';

export const primaryColumn = (
  column: EntitySchemaColumnOptions,
): EntitySchemaColumnOptions => {
  return { ...column, primary: true };
};
