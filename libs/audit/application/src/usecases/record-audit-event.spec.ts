import { auditEntry, InMemoryAuditRepository } from '../testing/index.js';
import { RecordAuditEventUseCase } from './record-audit-event.usecase.js';

const NOW = new Date('2026-10-26T12:00:05Z');

describe('RecordAuditEventUseCase', () => {
  let repository: InMemoryAuditRepository;
  let useCase: RecordAuditEventUseCase;

  beforeEach(() => {
    repository = new InMemoryAuditRepository();
    useCase = new RecordAuditEventUseCase(repository, { now: () => NOW });
  });

  it('stores the event with the time it was recorded', async () => {
    const { recorded_at: _ignored, ...event } = auditEntry('event-1');

    await useCase.execute(event);

    expect(repository.items.get('event-1')).toEqual({
      ...event,
      recorded_at: NOW,
    });
  });

  it('stores an event delivered twice only once', async () => {
    const { recorded_at: _ignored, ...event } = auditEntry('event-1');

    await useCase.execute(event);
    await useCase.execute({ ...event, payload: { title: 'changed' } });

    expect(repository.items.size).toBe(1);
    expect(repository.items.get('event-1')?.payload).toEqual({ title: 'KI' });
  });
});
