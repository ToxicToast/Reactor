import { status } from '@grpc/grpc-js';
import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  createTestContext,
  InMemoryIpBanRepository,
  ipBanAnemic,
  ListBansUseCase,
  TEST_NOW,
  UnbanIpUseCase,
} from '@toxictoast/security-application';
import { IpBanFactory } from '@toxictoast/security-domain';
import {
  grpcCode,
  TestActorProvider,
  testActor,
} from '@toxictoast/shared-grpc';
import { BanGrpcController } from './ban-grpc.controller.js';

describe('BanGrpcController', () => {
  let actors: TestActorProvider;
  let controller: BanGrpcController;

  beforeEach(async () => {
    const repository = new InMemoryIpBanRepository();
    await repository.save(ipBanAnemic('ban-1'));
    const clock = { now: () => TEST_NOW };
    actors = new TestActorProvider(testActor(['security.ban.manage']));
    controller = new BanGrpcController(
      new ListBansUseCase(repository, clock),
      new UnbanIpUseCase(
        new IpBanFactory(createTestContext()),
        repository,
        new DomainPersistence(new InMemoryOutbox(), new ImmediateUnitOfWork()),
        clock,
      ),
      actors,
    );
  });

  it('lists active bans', async () => {
    const response = await controller.listBans({ active_only: true });

    expect(response.bans).toEqual([
      expect.objectContaining({
        id: 'ban-1',
        ip: '203.0.113.7',
        banned_until: '2026-10-23T12:30:00.000Z',
      }),
    ]);
  });

  it('records who lifted the ban', async () => {
    const response = await controller.unbanIp({ ip: '203.0.113.7' });

    expect(response.ban?.lifted_by).toBe(testActor().id);
  });

  it('requires the ban permission', async () => {
    actors.actor = testActor(['blog.post.write']);

    await expect(
      grpcCode(controller.listBans({ active_only: true })),
    ).resolves.toBe(status.PERMISSION_DENIED);
  });
});
