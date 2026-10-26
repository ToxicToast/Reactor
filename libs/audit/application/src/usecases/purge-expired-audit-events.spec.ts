import { AuditRetentionPolicy } from '@toxictoast/audit-domain';
import { auditEntry, InMemoryAuditRepository } from '../testing/index.js';
import { PurgeExpiredAuditEventsUseCase } from './purge-expired-audit-events.usecase.js';

const NOW = new Date('2026-10-26T12:00:00Z');

describe('PurgeExpiredAuditEventsUseCase', () => {
  let repository: InMemoryAuditRepository;
  let useCase: PurgeExpiredAuditEventsUseCase;

  beforeEach(async () => {
    repository = new InMemoryAuditRepository();
    useCase = new PurgeExpiredAuditEventsUseCase(
      repository,
      new AuditRetentionPolicy({
        retentionDays: 365,
        overrides: { 'security.access': 30 },
      }),
      { now: () => NOW },
    );

    await repository.record(
      auditEntry('denied-old', {
        event_namespace: 'security.access',
        occurred_at: new Date('2026-09-01T12:00:00Z'),
      }),
    );
    await repository.record(
      auditEntry('denied-new', {
        event_namespace: 'security.access',
        occurred_at: new Date('2026-10-20T12:00:00Z'),
      }),
    );
    await repository.record(
      auditEntry('tag-old', { occurred_at: new Date('2025-01-01T12:00:00Z') }),
    );
    await repository.record(
      auditEntry('tag-september', {
        occurred_at: new Date('2026-09-01T12:00:00Z'),
      }),
    );
  });

  it('removes denied requests after 30 days and the rest after a year', async () => {
    const result = await useCase.execute();

    expect(result.value).toEqual({ removed: 2 });
    expect([...repository.items.keys()].sort()).toEqual([
      'denied-new',
      'tag-september',
    ]);
  });
});
