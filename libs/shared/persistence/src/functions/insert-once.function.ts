import type { ObjectLiteral, Repository } from 'typeorm';
import { insertMissing } from './insert-missing.function.js';

/** true, wenn die Zeile neu war */
export const insertOnce = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  row: T,
): Promise<boolean> => {
  const inserted = await insertMissing(repository, [row]);
  return inserted.length > 0;
};
