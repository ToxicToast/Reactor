import type { Nullable, Optional } from '@toxictoast/shared-kernel';
import { mapEnum } from './map-enum.function.js';

export const mapOptionalEnum = <TFrom extends string, TTo>(
  table: Readonly<Record<TFrom, Nullable<TTo>>>,
  value: Optional<TFrom>,
  field: string,
): Optional<TTo> => {
  if (value === undefined) {
    return undefined;
  }
  return mapEnum(table, value, field);
};
