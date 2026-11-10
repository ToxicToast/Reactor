import type { UseCase } from '@toxictoast/shared-application';
import type { Result } from '@toxictoast/shared-kernel';
import type {
  WebhookAnemic,
  WebhookFactory,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import type { WebhookIdInput } from '../data/index.js';
import { changeWebhook } from '../functions/index.js';

export class DeleteWebhookUseCase implements UseCase<
  WebhookIdInput,
  WebhookAnemic
> {
  constructor(
    private readonly factory: WebhookFactory,
    private readonly repository: WebhookRepository,
  ) {}

  execute(input: WebhookIdInput): Promise<Result<WebhookAnemic>> {
    return changeWebhook(this.factory, this.repository, input.id, (webhook) => {
      return webhook.delete();
    });
  }
}
