import type { Optional } from '@toxictoast/shared-types';

export const paginate = <T>(
  items: ReadonlyArray<T>,
  limit?: Optional<number>,
  offset: Optional<number> = 0,
): Array<T> => {
  return items.slice(offset, limit === undefined ? undefined : offset + limit);
};
