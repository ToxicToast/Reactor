import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  WebhookFactory,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import type { WebhookIdInput, WebhookWithSecret } from '../data/index.js';
import { changeWebhook } from '../functions/index.js';
import type { WebhookSecretGenerator } from '../interfaces/index.js';

export class RotateWebhookSecretUseCase implements UseCase<
  WebhookIdInput,
  WebhookWithSecret
> {
  constructor(
    private readonly factory: WebhookFactory,
    private readonly repository: WebhookRepository,
    private readonly secrets: WebhookSecretGenerator,
  ) {}

  async execute(input: WebhookIdInput): Promise<Result<WebhookWithSecret>> {
    const secret = this.secrets.generate();
    const webhook = await changeWebhook(
      this.factory,
      this.repository,
      input.id,
      (domain) => domain.rotateSecret(secret),
    );
    if (webhook.isFailure) {
      return Result.fail(webhook.error);
    }
    return Result.ok({ webhook: webhook.value, secret });
  }
}
