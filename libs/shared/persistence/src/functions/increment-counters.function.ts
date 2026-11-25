import type { ObjectLiteral, Repository } from 'typeorm';
import { upsertCounters } from './upsert-counters.function.js';

export const incrementCounters = <T extends ObjectLiteral>(
  repository: Repository<T>,
  keys: Readonly<Record<string, string>>,
  deltas: Readonly<Record<string, number | undefined>>,
): Promise<void> => {
  const values = Object.entries(deltas).filter(
    (entry): entry is [string, number] => {
      return entry[1] !== undefined && entry[1] !== 0;
    },
  );
  return upsertCounters(repository, keys, values, (column, table) => {
    return `${table}.${column} + EXCLUDED.${column}`;
  });
};
