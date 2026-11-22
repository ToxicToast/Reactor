import type { UserDiff, UserRef } from '../interfaces/index.js';
import { uniqueByUserId } from './unique-by-user-id.function.js';

export const diffByUserId = <T extends UserRef>(
  previous: ReadonlyArray<T>,
  current: ReadonlyArray<T>,
): UserDiff<T> => {
  const before = new Set(previous.map((user) => user.user_id));
  const now = new Set(current.map((user) => user.user_id));

  return {
    added: uniqueByUserId(current).filter((user) => !before.has(user.user_id)),
    removed: uniqueByUserId(previous).filter((user) => !now.has(user.user_id)),
  };
};
