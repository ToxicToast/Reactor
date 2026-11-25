import type { Nullable } from '@toxictoast/shared-types';

export interface CountryLookup {
  /** ISO-3166 Alpha-2 oder null, wenn die IP fehlt, privat oder unbekannt ist */
  countryOf(ip: Nullable<string>): Nullable<string>;
}
