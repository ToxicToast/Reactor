import type { Nullable } from '@toxictoast/shared-kernel';
import { invalidArgument } from './invalid-argument.function.js';

export const mapEnum = <TFrom extends string, TTo>(
  table: Readonly<Record<TFrom, Nullable<TTo>>>,
  value: TFrom,
  field: string,
): TTo => {
  const mapped = table[value];
  if (mapped === null || mapped === undefined) {
    throw invalidArgument(`${field} has an invalid value`);
  }
  return mapped;
};
