import {
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

  beforeEach(() => {
    factory = new WebhookFactory(createWebhookTestContext());
    repository = new InMemoryWebhookRepository();
    secrets = new FixedWebhookSecretGenerator();
  });

  it('creates a webhook and returns its secret once', async () => {
    const result = await new CreateWebhookUseCase(
      factory,
      repository,
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
  });

  it('refuses invalid data', async () => {
    const result = await new CreateWebhookUseCase(
      factory,
      repository,
      secrets,
    ).execute({ url: 'kaputt', events: [] });

    expect(result.isFailure).toBe(true);
    expect(repository.items.size).toBe(0);
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

    const result = await new UpdateWebhookUseCase(factory, repository).execute({
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
  });

  it('deletes a webhook softly', async () => {
    await repository.save(webhookAnemic(WEBHOOK_ID));

    const result = await new DeleteWebhookUseCase(factory, repository).execute({
      id: WEBHOOK_ID,
    });

    expect(result.value.deleted_at).toEqual(WEBHOOK_TEST_NOW);
    expect(await repository.findById(WEBHOOK_ID)).toBeNull();
  });

  it('rotates the secret', async () => {
    await repository.save(webhookAnemic(WEBHOOK_ID));

    const result = await new RotateWebhookSecretUseCase(
      factory,
      repository,
      secrets,
    ).execute({ id: WEBHOOK_ID });

    expect(result.value.secret).toBe('whsec_1');
    expect(result.value.webhook.secret).toBe('whsec_1');
  });

  it('fails for an unknown webhook', async () => {
    const results = await Promise.all([
      new UpdateWebhookUseCase(factory, repository).execute({
        id: 'unknown',
        url: 'https://hooks.example.com',
        events: ['*'],
        active: true,
      }),
      new DeleteWebhookUseCase(factory, repository).execute({ id: 'unknown' }),
      new RotateWebhookSecretUseCase(factory, repository, secrets).execute({
        id: 'unknown',
      }),
    ]);

    expect(results.map((result) => result.error.code)).toEqual([
      'NOT_FOUND',
      'NOT_FOUND',
      'NOT_FOUND',
    ]);
  });
});
