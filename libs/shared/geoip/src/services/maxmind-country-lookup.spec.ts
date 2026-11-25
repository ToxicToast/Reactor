import type { CountryResponse, Reader } from 'maxmind';
import { MaxmindCountryLookup } from './maxmind-country-lookup.service.js';

const responses: Record<string, CountryResponse> = {
  '203.0.113.7': { country: { iso_code: 'DE' } } as CountryResponse,
  '198.51.100.1': {
    registered_country: { iso_code: 'NL' },
  } as CountryResponse,
};

describe('MaxmindCountryLookup', () => {
  let get: jest.Mock;
  let lookup: MaxmindCountryLookup;

  beforeEach(() => {
    get = jest.fn((ip: string) => responses[ip] ?? null);
    lookup = new MaxmindCountryLookup({
      get,
    } as unknown as Pick<Reader<CountryResponse>, 'get'>);
  });

  it('returns the country of the ip', () => {
    expect(lookup.countryOf('203.0.113.7')).toBe('DE');
  });

  it('unwraps ipv4 addresses mapped into ipv6', () => {
    expect(lookup.countryOf('::ffff:203.0.113.7')).toBe('DE');
  });

  it('falls back to the registered country', () => {
    expect(lookup.countryOf('198.51.100.1')).toBe('NL');
  });

  it('returns null for unknown ips', () => {
    expect(lookup.countryOf('192.168.0.10')).toBeNull();
  });

  it('never asks the reader for values that are not ips', () => {
    expect(lookup.countryOf('kaputt')).toBeNull();
    expect(lookup.countryOf(null)).toBeNull();
    expect(get).not.toHaveBeenCalled();
  });
});
