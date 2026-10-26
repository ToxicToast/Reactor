import { isUuid } from '@toxictoast/shared-kernel';
import type { Optional } from '@toxictoast/shared-types';
import { invalidArgument } from './invalid-argument.function.js';

export const parseOptionalUuid = (
  value: Optional<string>,
  field: string,
): Optional<string> => {
  if (value === undefined || value === '') {
    return undefined;
  }
  if (!isUuid(value)) {
    throw invalidArgument(`${field} must be a uuid`);
  }
  return value.toLowerCase();
};
