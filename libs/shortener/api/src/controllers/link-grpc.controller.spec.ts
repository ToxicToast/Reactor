import { status } from '@grpc/grpc-js';
import { DomainPersistence } from '@toxictoast/shared-application';
import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import {
  grpcCode,
  TestActorProvider,
  testActor,
} from '@toxictoast/shared-grpc/testing';
import { createFixedTestContext } from '@toxictoast/shared-kernel/testing';
import {
  CreateLinkUseCase,
  DeleteLinkUseCase,
  GetLinkStatsUseCase,
  GetLinkUseCase,
  ListLinksUseCase,
  ResolveLinkUseCase,
  RestoreLinkUseCase,
  UpdateLinkUseCase,
} from '@toxictoast/shortener-application';
import {
  InMemoryLinkClickRepository,
  InMemoryLinkRepository,
  TEST_NOW,
} from '@toxictoast/shortener-application/testing';
import { LinkFactory } from '@toxictoast/shortener-domain';
import { LinkGrpcController } from './link-grpc.controller.js';

const LINK_ID = '0192f3a0-0000-7000-8000-00000000d001';
const TARGET = 'https://www.youtube.com/@ToxicToast';

describe('LinkGrpcController', () => {
  let actors: TestActorProvider;
  let controller: LinkGrpcController;

  beforeEach(() => {
    const ctx = createFixedTestContext(LINK_ID, () => TEST_NOW);
    const factory = new LinkFactory(ctx);
    const repository = new InMemoryLinkRepository();
    const persistence = new DomainPersistence(
      new InMemoryOutbox(),
      new ImmediateUnitOfWork(),
    );
    actors = new TestActorProvider(testActor(['shortener.link.write']));
    controller = new LinkGrpcController(
      new CreateLinkUseCase(factory, repository, persistence),
      new UpdateLinkUseCase(factory, repository, persistence),
      new DeleteLinkUseCase(factory, repository, persistence),
      new RestoreLinkUseCase(factory, repository, persistence),
      new GetLinkUseCase(repository),
      new ListLinksUseCase(repository),
      new ResolveLinkUseCase(factory, repository),
      new GetLinkStatsUseCase(
        repository,
        new InMemoryLinkClickRepository(),
        { time_zone: 'Europe/Berlin' },
        ctx,
      ),
      actors,
    );
  });

  it('creates and resolves a link', async () => {
    const created = await controller.createLink({ target_url: TARGET });

    expect(created.link).toMatchObject({ id: LINK_ID, active: true });
    await expect(controller.resolveLink({ id: LINK_ID })).resolves.toEqual({
      target_url: TARGET,
    });
  });

  it('resolves without any permission', async () => {
    await controller.createLink({ target_url: TARGET });
    actors.actor = testActor([]);

    await expect(controller.resolveLink({ id: LINK_ID })).resolves.toEqual({
      target_url: TARGET,
    });
  });

  it('does not resolve unknown links', async () => {
    await expect(
      grpcCode(controller.resolveLink({ id: LINK_ID })),
    ).resolves.toBe(status.NOT_FOUND);
  });

  it('requires the write permission to list links', async () => {
    actors.actor = testActor([]);

    await expect(
      grpcCode(controller.listLinks({ with_deleted: false })),
    ).resolves.toBe(status.PERMISSION_DENIED);
  });

  it('requires the delete permission to delete links', async () => {
    await controller.createLink({ target_url: TARGET });

    await expect(
      grpcCode(controller.deleteLink({ id: LINK_ID })),
    ).resolves.toBe(status.PERMISSION_DENIED);
  });

  it('returns empty stats for a new link', async () => {
    await controller.createLink({ target_url: TARGET });

    const { stats } = await controller.getLinkStats({ id: LINK_ID });

    expect(stats).toEqual({
      total: 0,
      days: [],
      referrers: [],
      devices: [],
      browsers: [],
      countries: [],
    });
  });

  it('rejects a range that is not a date', async () => {
    await controller.createLink({ target_url: TARGET });

    await expect(
      grpcCode(controller.getLinkStats({ id: LINK_ID, from: 'kaputt' })),
    ).resolves.toBe(status.INVALID_ARGUMENT);
  });
});
