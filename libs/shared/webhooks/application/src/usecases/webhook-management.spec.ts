import { DomainPersistence } from '@toxictoast/shared-application';
import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import {
  WebhookEvents,
  WebhookFactory,
  type WebhookId,
} from '@toxictoast/shared-webhooks-domain';
import {
  createWebhookTestContext,
  FixedWebhookSecretGenerator,
  InMemoryWebhookRepository,
  WEBHOOK_TEST_NOW,
  webhookAnemic,
} from '../testing/index.js';
import { CreateWebhookUseCase } from './create-webhook.usecase.js';
import { DeleteWebhookUseCase } from './delete-webhook.usecase.js';
import { ListWebhooksUseCase } from './list-webhooks.usecase.js';
import { RotateWebhookSecretUseCase } from './rotate-webhook-secret.usecase.js';
import { UpdateWebhookUseCase } from './update-webhook.usecase.js';

const WEBHOOK_ID = 'webhook-1' as WebhookId;

describe('webhook management', () => {
  let factory: WebhookFactory;
  let repository: InMemoryWebhookRepository;
  let secrets: FixedWebhookSecretGenerator;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let persistence: DomainPersistence;

  const eventNames = (): Array<string> => {
    return outbox.events.map((event) => event.event_name);
  };

  beforeEach(() => {
    factory = new WebhookFactory(createWebhookTestContext());
    repository = new InMemoryWebhookRepository();
    secrets = new FixedWebhookSecretGenerator();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    persistence = new DomainPersistence(outbox, uow);
  });

  it('creates a webhook, returns its secret once and writes the event', async () => {
    const result = await new CreateWebhookUseCase(
      factory,
      repository,
      persistence,
      secrets,
    ).execute({
      url: 'https://hooks.example.com/twitch',
      events: ['twitch.stream.online'],
    });

    expect(result.value.secret).toBe('whsec_1');
    expect(result.value.webhook).toMatchObject({
      id: 'id-1',
      active: true,
      secret: 'whsec_1',
    });
    expect(repository.items.size).toBe(1);
    expect(uow.runs).toBe(1);
    expect(eventNames()).toEqual([WebhookEvents.CREATED.name]);
    expect(outbox.events[0].payload).not.toHaveProperty('secret');
    expect(outbox.events[0].payload).not.toHaveProperty('url');
  });

  it('refuses invalid data', async () => {
    const result = await new CreateWebhookUseCase(
      factory,
      repository,
      persistence,
      secrets,
    ).execute({ url: 'kaputt', events: [] });

    expect(result.isFailure).toBe(true);
    expect(repository.items.size).toBe(0);
    expect(outbox.events).toHaveLength(0);
  });

  it('lists only webhooks that are not deleted', async () => {
    await repository.save(webhookAnemic('webhook-1'));
    await repository.save(
      webhookAnemic('webhook-2', { deleted_at: WEBHOOK_TEST_NOW }),
    );

    const result = await new ListWebhooksUseCase(repository).execute();

    expect(result.value.map((webhook) => webhook.id)).toEqual(['webhook-1']);
  });

  it('updates a webhook', async () => {
    await repository.save(webhookAnemic(WEBHOOK_ID));

    const result = await new UpdateWebhookUseCase(
      factory,
      repository,
      persistence,
    ).execute({
      id: WEBHOOK_ID,
      url: 'https://hooks.example.com/neu',
      events: ['twitch.community.*'],
      description: 'Raids',
      active: false,
    });

    expect(result.value).toMatchObject({
      url: 'https://hooks.example.com/neu',
      events: ['twitch.community.*'],
      description: 'Raids',
      active: false,
      secret: 'whsec_test',
      updated_at: WEBHOOK_TEST_NOW,
    });
    expect(eventNames()).toEqual([WebhookEvents.UPDATED.name]);
  });

  it('deletes a webhook softly', async () => {
    await repository.save(webhookAnemic(WEBHOOK_ID));

    const result = await new DeleteWebhookUseCase(
      factory,
      repository,
      persistence,
    ).execute({ id: WEBHOOK_ID });

    expect(result.value.deleted_at).toEqual(WEBHOOK_TEST_NOW);
    expect(await repository.findById(WEBHOOK_ID)).toBeNull();
    expect(eventNames()).toEqual([WebhookEvents.DELETED.name]);
  });

  it('rotates the secret', async () => {
    await repository.save(webhookAnemic(WEBHOOK_ID));

    const result = await new RotateWebhookSecretUseCase(
      factory,
      repository,
      persistence,
      secrets,
    ).execute({ id: WEBHOOK_ID });

    expect(result.value.secret).toBe('whsec_1');
    expect(result.value.webhook.secret).toBe('whsec_1');
    expect(eventNames()).toEqual([WebhookEvents.SECRET_ROTATED.name]);
  });

  it('fails for an unknown webhook', async () => {
    const unknown = 'unknown' as WebhookId;
    const results = await Promise.all([
      new UpdateWebhookUseCase(factory, repository, persistence).execute({
        id: unknown,
        url: 'https://hooks.example.com',
        events: ['*'],
        active: true,
      }),
      new DeleteWebhookUseCase(factory, repository, persistence).execute({
        id: unknown,
      }),
      new RotateWebhookSecretUseCase(
        factory,
        repository,
        persistence,
        secrets,
      ).execute({ id: unknown }),
    ]);

    expect(results.map((result) => result.error.code)).toEqual([
      'NOT_FOUND',
      'NOT_FOUND',
      'NOT_FOUND',
    ]);
    expect(outbox.events).toHaveLength(0);
  });
});
