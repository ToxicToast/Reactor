import type { Nullable, Optional } from '@toxictoast/shared-kernel';

export const toIso = (date: Nullable<Date>): Optional<string> => {
  if (date === null) {
    return undefined;
  }
  return date.toISOString();
};
