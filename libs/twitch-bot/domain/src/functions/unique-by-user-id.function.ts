import type { UserRef } from '../interfaces/index.js';

/** Behält pro user_id den ersten Eintrag */
export const uniqueByUserId = <T extends UserRef>(
  users: ReadonlyArray<T>,
): Array<T> => {
  const seen = new Map<string, T>();
  for (const user of users) {
    if (!seen.has(user.user_id)) {
      seen.set(user.user_id, user);
    }
  }
  return [...seen.values()];
};
