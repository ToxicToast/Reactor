import { status } from '@grpc/grpc-js';
import {
  auditEntry,
  InMemoryAuditRepository,
  ListAuditEventsUseCase,
  PurgeExpiredAuditEventsUseCase,
} from '@toxictoast/audit-application';
import { AuditRetentionPolicy } from '@toxictoast/audit-domain';
import {
  grpcCode,
  TestActorProvider,
  testActor,
} from '@toxictoast/shared-grpc';
import { AuditGrpcController } from './audit-grpc.controller.js';

const EVENT_ID = '0192f3a0-0000-7000-8000-000000000001';

describe('AuditGrpcController', () => {
  let actors: TestActorProvider;
  let controller: AuditGrpcController;

  beforeEach(async () => {
    const repository = new InMemoryAuditRepository();
    await repository.record(auditEntry(EVENT_ID));
    actors = new TestActorProvider(testActor(['audit.read', 'audit.purge']));
    controller = new AuditGrpcController(
      new ListAuditEventsUseCase(repository),
      new PurgeExpiredAuditEventsUseCase(
        repository,
        new AuditRetentionPolicy({ retentionDays: 365, overrides: {} }),
        { now: () => new Date('2026-10-26T12:00:00Z') },
      ),
      actors,
    );
  });

  it('lists events with the payload as json', async () => {
    const response = await controller.listEvents({});

    expect(response.events).toEqual([
      expect.objectContaining({
        event_id: EVENT_ID,
        actor: {
          type: 'ai',
          id: '84b6270f-a853-417b-ab4b-8d56d9c36d94',
          ip: '203.0.113.7',
        },
        payload_json: '{"title":"KI"}',
      }),
    ]);
  });

  it('refuses a correlation id that is not a uuid', async () => {
    await expect(
      grpcCode(controller.listEvents({ correlation_id: 'kaputt' })),
    ).resolves.toBe(status.INVALID_ARGUMENT);
  });

  it('requires the read permission', async () => {
    actors.actor = testActor(['blog.post.write']);

    await expect(grpcCode(controller.listEvents({}))).resolves.toBe(
      status.PERMISSION_DENIED,
    );
  });

  it('requires the purge permission to purge', async () => {
    actors.actor = testActor(['audit.read']);

    await expect(grpcCode(controller.purgeExpiredEvents())).resolves.toBe(
      status.PERMISSION_DENIED,
    );
  });
});
