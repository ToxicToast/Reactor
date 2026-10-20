import type { Id } from '@toxictoast/shared-kernel';
import { invalidArgument } from './invalid-argument.function.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const parseId = <T extends string>(
  value: string,
  field = 'id',
): Id<T> => {
  if (!UUID.test(value)) {
    throw invalidArgument(`${field} must be a valid uuid`);
  }
  return value.toLowerCase() as Id<T>;
};
