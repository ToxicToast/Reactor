import type {
  AggregateEditor,
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  WebhookAnemic,
  WebhookDomain,
  WebhookFactory,
  WebhookId,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import type { WebhookIdInput, WebhookWithSecret } from '../data/index.js';
import { createWebhookEditor } from '../functions/index.js';
import type { WebhookSecretGenerator } from '../interfaces/index.js';

export class RotateWebhookSecretUseCase implements UseCase<
  WebhookIdInput,
  WebhookWithSecret
> {
  private readonly editor: AggregateEditor<WebhookAnemic, WebhookDomain>;

  constructor(
    factory: WebhookFactory,
    repository: WebhookRepository,
    persistence: DomainPersistence,
    private readonly secrets: WebhookSecretGenerator,
  ) {
    this.editor = createWebhookEditor(factory, repository, persistence);
  }

  async execute(input: WebhookIdInput): Promise<Result<WebhookWithSecret>> {
    const secret = this.secrets.generate();
    const webhook = await this.editor.change(input.id as WebhookId, (domain) =>
      domain.rotateSecret(secret),
    );
    if (webhook.isFailure) {
      return Result.fail(webhook.error);
    }
    return Result.ok({ webhook: webhook.value, secret });
  }
}
