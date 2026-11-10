import type { InsertQueryBuilder, ObjectLiteral, Repository } from 'typeorm';

type InsertValues<T extends ObjectLiteral> = Parameters<
  InsertQueryBuilder<T>['values']
>[0];

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
