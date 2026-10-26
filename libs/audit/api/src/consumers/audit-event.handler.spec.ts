import {
  InMemoryAuditRepository,
  RecordAuditEventUseCase,
} from '@toxictoast/audit-application';
import { AuditEventHandler } from './audit-event.handler.js';

const NOW = new Date('2026-10-26T17:29:27Z');

describe('AuditEventHandler', () => {
  let repository: InMemoryAuditRepository;
  let handler: AuditEventHandler;

  beforeEach(() => {
    repository = new InMemoryAuditRepository();
    handler = new AuditEventHandler(
      new RecordAuditEventUseCase(repository, { now: () => NOW }),
    );
  });

  it('records every valid event', async () => {
    await handler.handle({
      event_id: '0192f3a0-0000-7000-8000-000000000001',
      event_namespace: 'security.ip',
      event_name: 'banned',
      event_version: 1,
      aggregate_id: '01a177a3-8fb1-7e2c-b09c-dfaa38e7989d',
      occurred_at: '2026-10-26T09:56:10.289Z',
      actor: { type: 'anonymous', id: null, ip: '::1' },
      correlation_id: null,
      payload: { ip: '::1', level: 1 },
    });

    expect(
      repository.items.get('0192f3a0-0000-7000-8000-000000000001'),
    ).toMatchObject({
      event_namespace: 'security.ip',
      recorded_at: NOW,
    });
  });

  it('ignores events that cannot be audited', async () => {
    await handler.handle({ event_name: 'banned' });

    expect(repository.items.size).toBe(0);
  });
});
