import type { Nullable } from '@toxictoast/shared-types';
import { CLICK_LIMITS } from '../constants/index.js';

/** ISO-3166 Alpha-2, sonst null */
export const countryOf = (country: Nullable<string>): Nullable<string> => {
  const normalized = country?.trim().toUpperCase() ?? '';
  if (
    normalized.length !== CLICK_LIMITS.COUNTRY_LENGTH ||
    !/^[A-Z]+$/.test(normalized)
  ) {
    return null;
  }
  return normalized;
};
