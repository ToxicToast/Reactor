import type { ObjectLiteral, Repository } from 'typeorm';
import type { InsertValues } from '../types/index.js';

/**
 * Fügt nur Zeilen ein, deren Primärschlüssel noch fehlt, und gibt die
 * tatsächlich eingefügten Zeilen zurück. Voraussetzung: Spaltennamen
 * entsprechen den Property-Namen.
 */
export const insertMissing = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  rows: ReadonlyArray<T>,
): Promise<Array<T>> => {
  if (rows.length === 0) {
    return [];
  }
  const result = await repository
    .createQueryBuilder()
    .insert()
    .into(repository.target)
    .values([...rows] as unknown as InsertValues<T>)
    .orIgnore()
    .returning('*')
    .execute();
  return result.raw as Array<T>;
};
