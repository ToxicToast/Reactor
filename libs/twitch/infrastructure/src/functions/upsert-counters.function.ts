import type { ObjectLiteral, Repository } from 'typeorm';
import { columnOf } from './column-of.function.js';
import { quoteIdentifier } from './quote-identifier.function.js';

export const upsertCounters = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  keys: Readonly<Record<string, string>>,
  values: ReadonlyArray<readonly [string, number]>,
  assign: (column: string, table: string) => string,
): Promise<void> => {
  if (values.length === 0) {
    return;
  }

  const table = quoteIdentifier(repository.metadata.tableName);
  const keyColumns = Object.keys(keys).map((key) => columnOf(repository, key));
  const valueColumns = values.map(([key]) => columnOf(repository, key));
  const params = [...Object.values(keys), ...values.map(([, value]) => value)];
  const placeholders = params.map((_, index) => `$${index + 1}`);
  const updates = valueColumns.map((column) => {
    return `${column} = ${assign(column, table)}`;
  });

  await repository.manager.query(
    `INSERT INTO ${table} (${[...keyColumns, ...valueColumns].join(', ')}) ` +
      `VALUES (${placeholders.join(', ')}) ` +
      `ON CONFLICT (${keyColumns.join(', ')}) DO UPDATE SET ${updates.join(', ')}`,
    params,
  );
};
