import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  WebhookFactory,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import type { CreateWebhookInput, WebhookWithSecret } from '../data/index.js';
import type { WebhookSecretGenerator } from '../interfaces/index.js';

export class CreateWebhookUseCase implements UseCase<
  CreateWebhookInput,
  WebhookWithSecret
> {
  constructor(
    private readonly factory: WebhookFactory,
    private readonly repository: WebhookRepository,
    private readonly secrets: WebhookSecretGenerator,
  ) {}

  async execute(input: CreateWebhookInput): Promise<Result<WebhookWithSecret>> {
    const secret = this.secrets.generate();
    const created = this.factory.createDomain({ ...input, secret });
    if (created.isFailure) {
      return Result.fail(created.error);
    }

    const webhook = await this.repository.save(
      this.factory.constitute(created.value),
    );
    return Result.ok({ webhook, secret });
  }
}
