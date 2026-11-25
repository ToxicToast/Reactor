import { NullCountryLookup } from '../services/index.js';
import { countryLookupFromEnv } from './country-lookup-from-env.function.js';

describe('countryLookupFromEnv', () => {
  it('works without countries when no database is configured', async () => {
    const onUnavailable = jest.fn();

    const lookup = await countryLookupFromEnv(onUnavailable, {});

    expect(lookup).toBeInstanceOf(NullCountryLookup);
    expect(onUnavailable).not.toHaveBeenCalled();
  });

  it('reports a missing database file and keeps running', async () => {
    const onUnavailable = jest.fn();

    const lookup = await countryLookupFromEnv(onUnavailable, {
      GEOIP_COUNTRY_DATABASE: '/does/not/exist.mmdb',
    });

    expect(lookup).toBeInstanceOf(NullCountryLookup);
    expect(onUnavailable).toHaveBeenCalledTimes(1);
  });
});
