import type { ObjectLiteral, Repository } from 'typeorm';
import { quoteIdentifier } from './quote-identifier.function.js';

/** Liefert den quotierten Spaltennamen, nur für Spalten, die das Schema wirklich kennt. */
export const columnOf = <T extends ObjectLiteral>(
  repository: Repository<T>,
  property: string,
): string => {
  const column = repository.metadata.findColumnWithPropertyName(property);
  if (!column) {
    throw new Error(
      `Unknown column ${property} in ${repository.metadata.tableName}`,
    );
  }
  return quoteIdentifier(column.databaseName);
};
