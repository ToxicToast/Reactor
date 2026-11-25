import type { CountryLookup } from '@toxictoast/shared-geoip';
import type { DomainContext } from '@toxictoast/shared-kernel';
import type { EventPublisher } from '@toxictoast/shared-messaging';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { Request } from 'express';
import { LinkClickReporter } from './link-click-reporter.service.js';

const LINK_ID = '0192f3a0-0000-7000-8000-00000000d001';

describe('LinkClickReporter', () => {
  let publish: jest.Mock;
  let countryOf: jest.Mock;
  let reporter: LinkClickReporter;

  beforeEach(() => {
    publish = jest.fn().mockResolvedValue(undefined);
    countryOf = jest.fn().mockReturnValue('DE');
    const ctx = {
      id: { generate: () => 'event-1' },
      date: { now: () => new Date('2026-11-25T12:00:00Z') },
    } as unknown as DomainContext;
    reporter = new LinkClickReporter(
      { publish } as unknown as EventPublisher,
      ctx,
      new CorrelationContext(),
      { countryOf } as CountryLookup,
    );
  });

  it('publishes referer, user agent and country but never the ip', () => {
    reporter.report(LINK_ID, {
      method: 'GET',
      ip: '203.0.113.7',
      headers: {
        referer: 'https://www.instagram.com/',
        'user-agent': 'Mozilla/5.0 (iPhone)',
      },
    } as unknown as Request);

    const [[events]] = publish.mock.calls;
    expect(countryOf).toHaveBeenCalledWith('203.0.113.7');
    expect(events[0]).toMatchObject({
      event_namespace: 'shortener.click',
      event_name: 'clicked',
      aggregate_id: LINK_ID,
      actor: { type: 'anonymous', id: null, ip: null },
      payload: {
        link_id: LINK_ID,
        referer: 'https://www.instagram.com/',
        user_agent: 'Mozilla/5.0 (iPhone)',
        country: 'DE',
      },
    });
    expect(JSON.stringify(events[0])).not.toContain('203.0.113.7');
  });

  it('sends null for missing headers and a missing ip', () => {
    countryOf.mockReturnValue(null);

    reporter.report(LINK_ID, {
      method: 'GET',
      headers: {},
    } as unknown as Request);

    const [[events]] = publish.mock.calls;
    expect(countryOf).toHaveBeenCalledWith(null);
    expect(events[0].payload).toMatchObject({
      referer: null,
      user_agent: null,
      country: null,
    });
  });

  it('does not count head requests', () => {
    reporter.report(LINK_ID, {
      method: 'HEAD',
      headers: {},
    } as unknown as Request);

    expect(publish).not.toHaveBeenCalled();
    expect(countryOf).not.toHaveBeenCalled();
  });
});
