import type { Optional } from '@toxictoast/shared-types';
import { invalidArgument } from './invalid-argument.function.js';
import { parseDate } from './parse-date.function.js';

export const requireDate = (value: Optional<string>, field: string): Date => {
  const date = parseDate(value, field);
  if (!date) {
    throw invalidArgument(`${field} is required`);
  }
  return date;
};
