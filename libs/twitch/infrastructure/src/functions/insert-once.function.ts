import { insertMissing } from '@toxictoast/shared-persistence';
import type { ObjectLiteral, Repository } from 'typeorm';

/** true, wenn die Zeile neu war */
export const insertOnce = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  row: T,
): Promise<boolean> => {
  const inserted = await insertMissing(repository, [row]);
  return inserted.length > 0;
};
