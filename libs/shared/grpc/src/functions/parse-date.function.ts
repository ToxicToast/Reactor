import type { Optional } from '@toxictoast/shared-types';
import { invalidArgument } from './invalid-argument.function.js';

export const parseDate = (
  value: Optional<string>,
  field: string,
): Optional<Date> => {
  if (value === undefined || value === '') {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw invalidArgument(`${field} must be an ISO 8601 date`);
  }
  return date;
};
