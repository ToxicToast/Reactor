import type { ObjectLiteral, Repository } from 'typeorm';
import { upsertCounters } from './upsert-counters.function.js';

export const raiseCounter = <T extends ObjectLiteral>(
  repository: Repository<T>,
  keys: Readonly<Record<string, string>>,
  column: string,
  value: number,
): Promise<void> => {
  return upsertCounters(repository, keys, [[column, value]], (name, table) => {
    return `GREATEST(${table}.${name}, EXCLUDED.${name})`;
  });
};
