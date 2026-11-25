import { open, type CountryResponse } from 'maxmind';
import { GEOIP_READER_OPTIONS } from '../constants/index.js';
import type { CountryLookup } from '../interfaces/index.js';
import { MaxmindCountryLookup } from '../services/index.js';

export const openCountryLookup = async (
  path: string,
): Promise<CountryLookup> => {
  return new MaxmindCountryLookup(
    await open<CountryResponse>(path, GEOIP_READER_OPTIONS),
  );
};
