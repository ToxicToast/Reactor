import { optionalEnv } from '@toxictoast/shared-system';
import { GEOIP_ENV } from '../constants/index.js';
import type { CountryLookup } from '../interfaces/index.js';
import { NullCountryLookup } from '../services/index.js';
import { openCountryLookup } from './open-country-lookup.function.js';

/** eine fehlende oder kaputte Datenbank kostet nur das Land, nie den Start */
export const countryLookupFromEnv = async (
  onUnavailable: (error: unknown) => void,
  source: NodeJS.ProcessEnv = process.env,
): Promise<CountryLookup> => {
  const path = optionalEnv(GEOIP_ENV.COUNTRY_DATABASE, undefined, source);
  if (path === undefined) {
    return new NullCountryLookup();
  }
  try {
    return await openCountryLookup(path);
  } catch (error) {
    onUnavailable(error);
    return new NullCountryLookup();
  }
};
