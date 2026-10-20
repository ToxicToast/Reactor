import { isUuid, type Id } from '@toxictoast/shared-kernel';
import { invalidArgument } from './invalid-argument.function.js';

export const parseId = <T extends string>(
  value: string,
  field = 'id',
): Id<T> => {
  if (!isUuid(value)) {
    throw invalidArgument(`${field} must be a valid uuid`);
  }
  return value.toLowerCase() as Id<T>;
};
