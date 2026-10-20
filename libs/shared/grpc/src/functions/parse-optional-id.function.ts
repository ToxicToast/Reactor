import type { Id, Nullable, Optional } from '@toxictoast/shared-kernel';
import { parseId } from './parse-id.function.js';

export const parseOptionalId = <T extends string>(
  value: Optional<string>,
  field: string,
): Nullable<Id<T>> => {
  if (value === undefined || value === '') {
    return null;
  }
  return parseId<T>(value, field);
};
