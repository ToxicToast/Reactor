import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { BanPolicy, IpBanFactory } from '@toxictoast/security-domain';
import {
  createTestContext,
  InMemoryFailedAttemptCounter,
  InMemoryIpBanRepository,
  ipBanAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { RecordAccessDeniedUseCase } from './record-access-denied.usecase.js';

const IP = '203.0.113.7';
const MINUTE = 60 * 1000;

describe('RecordAccessDeniedUseCase', () => {
  let repository: InMemoryIpBanRepository;
  let counter: InMemoryFailedAttemptCounter;
  let outbox: InMemoryOutbox;
  let useCase: RecordAccessDeniedUseCase;

  const deny = (times: number, ip = IP) => {
    return Array.from({ length: times }).reduce<Promise<unknown>>(
      async (previous) => {
        await previous;
        return useCase.execute({ ip });
      },
      Promise.resolve(),
    );
  };

  beforeEach(() => {
    repository = new InMemoryIpBanRepository();
    counter = new InMemoryFailedAttemptCounter();
    outbox = new InMemoryOutbox();
    useCase = new RecordAccessDeniedUseCase(
      new IpBanFactory(createTestContext()),
      repository,
      new BanPolicy({
        threshold: 3,
        windowSeconds: 300,
        durationsMinutes: [30, 120, 720, 10080],
        strikeWindowDays: 30,
        allowlist: ['127.0.0.1'],
      }),
      counter,
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
      { now: () => TEST_NOW },
    );
  });

  it('only counts below the threshold', async () => {
    const result = await useCase.execute({ ip: IP });

    expect(result.value).toEqual({ failed_attempts: 1, ban: null });
    expect(repository.items.size).toBe(0);
  });

  it('bans for 30 minutes when the threshold is reached', async () => {
    await deny(2);

    const result = await useCase.execute({ ip: IP });

    expect(result.value.ban).toMatchObject({
      ip: IP,
      level: 1,
      failed_attempts: 3,
      banned_until: new Date(TEST_NOW.getTime() + 30 * MINUTE),
    });
    expect(outbox.events.map((e) => e.event_name)).toEqual(['banned']);
    expect(counter.counts.has(IP)).toBe(false);
  });

  it('escalates with previous bans in the strike window', async () => {
    await repository.save(
      ipBanAnemic('old-1', {
        banned_until: new Date('2026-10-20T12:30:00Z'),
        created_at: new Date('2026-10-20T12:00:00Z'),
      }),
    );
    await repository.save(
      ipBanAnemic('old-2', {
        banned_until: new Date('2026-10-21T14:00:00Z'),
        created_at: new Date('2026-10-21T12:00:00Z'),
      }),
    );

    await deny(3);

    const [ban] = await repository.findActive(TEST_NOW);
    expect(ban).toMatchObject({
      level: 3,
      banned_until: new Date(TEST_NOW.getTime() + 720 * MINUTE),
    });
  });

  it('forgets bans older than the strike window', async () => {
    await repository.save(
      ipBanAnemic('ancient', {
        banned_until: new Date('2026-08-01T12:30:00Z'),
        created_at: new Date('2026-08-01T12:00:00Z'),
      }),
    );

    await deny(3);

    const [ban] = await repository.findActive(TEST_NOW);
    expect(ban.level).toBe(1);
  });

  it('does not count while the ip is banned', async () => {
    await deny(3);
    outbox.events.length = 0;

    const result = await useCase.execute({ ip: IP });

    expect(result.value.failed_attempts).toBe(0);
    expect(result.value.ban?.level).toBe(1);
    expect(counter.counts.has(IP)).toBe(false);
    expect(outbox.events).toHaveLength(0);
  });

  it('never counts ips on the allowlist', async () => {
    await deny(5, '::ffff:127.0.0.1');

    expect(counter.counts.size).toBe(0);
    expect(repository.items.size).toBe(0);
  });

  it('refuses invalid ip addresses', async () => {
    const result = await useCase.execute({ ip: 'kaputt' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
    expect(counter.counts.size).toBe(0);
  });
});
