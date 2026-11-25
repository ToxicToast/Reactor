import type { Nullable } from '@toxictoast/shared-types';
import type { CountryLookup } from '../interfaces/index.js';

/** ohne Datenbank: kein Land, aber auch kein Fehler */
export class NullCountryLookup implements CountryLookup {
  countryOf(): Nullable<string> {
    return null;
  }
}
