import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { IpBanFactory } from '@toxictoast/security-domain';
import {
  createTestContext,
  InMemoryIpBanRepository,
  ipBanAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { UnbanIpUseCase } from './unban-ip.usecase.js';

describe('UnbanIpUseCase', () => {
  let repository: InMemoryIpBanRepository;
  let outbox: InMemoryOutbox;
  let useCase: UnbanIpUseCase;

  beforeEach(async () => {
    repository = new InMemoryIpBanRepository();
    outbox = new InMemoryOutbox();
    useCase = new UnbanIpUseCase(
      new IpBanFactory(createTestContext()),
      repository,
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
      { now: () => TEST_NOW },
    );
    await repository.save(ipBanAnemic('ban-1'));
  });

  it('lifts the active ban of the ip', async () => {
    const result = await useCase.execute({
      ip: '::ffff:203.0.113.7',
      lifted_by: 'admin-1',
    });

    expect(result.value).toMatchObject({
      lifted_at: TEST_NOW,
      lifted_by: 'admin-1',
    });
    expect(outbox.events.map((e) => e.event_name)).toEqual(['unbanned']);
  });

  it('fails when the ip has no active ban', async () => {
    const result = await useCase.execute({
      ip: '198.51.100.1',
      lifted_by: 'admin-1',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
