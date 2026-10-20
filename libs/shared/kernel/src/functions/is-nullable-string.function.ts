import type { Nullable } from '@toxictoast/shared-types';

export const isNullableString = (value: unknown): value is Nullable<string> => {
  return value === null || typeof value === 'string';
};
