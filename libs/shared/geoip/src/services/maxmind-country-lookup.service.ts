import { isIP } from 'node:net';
import { normalizeIp } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { CountryResponse, Reader } from 'maxmind';
import type { CountryLookup } from '../interfaces/index.js';

export class MaxmindCountryLookup implements CountryLookup {
  constructor(private readonly reader: Pick<Reader<CountryResponse>, 'get'>) {}

  countryOf(ip: Nullable<string>): Nullable<string> {
    if (!ip) {
      return null;
    }
    const normalized = normalizeIp(ip);
    // der Reader wirft bei allem, was keine IP ist
    if (isIP(normalized) === 0) {
      return null;
    }
    const response = this.reader.get(normalized);
    return (
      response?.country?.iso_code ??
      response?.registered_country?.iso_code ??
      null
    );
  }
}
