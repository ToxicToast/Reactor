import { auditEntry, InMemoryAuditRepository } from '../testing/index.js';
import { ListAuditEventsUseCase } from './list-audit-events.usecase.js';

describe('ListAuditEventsUseCase', () => {
  let repository: InMemoryAuditRepository;
  let useCase: ListAuditEventsUseCase;

  beforeEach(async () => {
    repository = new InMemoryAuditRepository();
    useCase = new ListAuditEventsUseCase(repository);
    await repository.record(
      auditEntry('older', { occurred_at: new Date('2026-10-26T11:00:00Z') }),
    );
    await repository.record(auditEntry('newer'));
    await repository.record(
      auditEntry('other-request', { correlation_id: 'other' }),
    );
  });

  it('finds everything that belongs to one request, newest first', async () => {
    const result = await useCase.execute({
      correlation_id: '01a16a00-aaaa-7000-8000-000000000001',
    });

    expect(result.value.map((entry) => entry.event_id)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('caps the page size', async () => {
    const find = jest.spyOn(repository, 'find');

    await useCase.execute({ limit: 10000 });

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100, offset: 0 }),
    );
  });

  it('uses a default page size', async () => {
    const find = jest.spyOn(repository, 'find');

    await useCase.execute({});

    expect(find).toHaveBeenCalledWith(expect.objectContaining({ limit: 50 }));
  });
});
