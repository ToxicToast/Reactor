import type { DomainContext } from '@toxictoast/shared-kernel';
import type { EventPublisher } from '@toxictoast/shared-messaging';
import { ActorContext, CorrelationContext } from '@toxictoast/shared-system';
import type { Request } from 'express';
import { AccessDeniedReporter } from './access-denied-reporter.service.js';

const NOW = new Date('2026-10-25T12:00:00Z');

describe('AccessDeniedReporter', () => {
  let publish: jest.Mock;
  let reporter: AccessDeniedReporter;

  const request = {
    ip: '::ffff:203.0.113.7',
    method: 'POST',
    path: '/api/v1/blog/posts',
    headers: { 'user-agent': 'curl/8.0' },
  } as unknown as Request;

  beforeEach(() => {
    publish = jest.fn().mockResolvedValue(undefined);
    reporter = new AccessDeniedReporter(
      { publish } as unknown as EventPublisher,
      {
        id: { generate: () => 'event-1' },
        date: { now: () => NOW },
      } as unknown as DomainContext,
      new ActorContext(),
      new CorrelationContext(),
    );
  });

  it('reports denied requests keyed by ip', () => {
    reporter.report(request, 401);

    expect(publish).toHaveBeenCalledWith([
      expect.objectContaining({
        event_namespace: 'security.access',
        event_name: 'denied',
        aggregate_id: '203.0.113.7',
        actor: { type: 'anonymous', id: null, ip: '203.0.113.7' },
        payload: {
          ip: '203.0.113.7',
          status_code: 401,
          method: 'POST',
          path: '/api/v1/blog/posts',
          user_agent: 'curl/8.0',
        },
      }),
    ]);
  });

  it.each([[404], [409], [500], [429]])('does not report %p', (statusCode) => {
    reporter.report(request, statusCode);

    expect(publish).not.toHaveBeenCalled();
  });
});
