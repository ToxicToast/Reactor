import type { UseCase } from '@toxictoast/shared-application';
import type { Result } from '@toxictoast/shared-kernel';
import type {
  WebhookAnemic,
  WebhookFactory,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import type { UpdateWebhookInput } from '../data/index.js';
import { changeWebhook } from '../functions/index.js';

export class UpdateWebhookUseCase implements UseCase<
  UpdateWebhookInput,
  WebhookAnemic
> {
  constructor(
    private readonly factory: WebhookFactory,
    private readonly repository: WebhookRepository,
  ) {}

  execute(input: UpdateWebhookInput): Promise<Result<WebhookAnemic>> {
    return changeWebhook(this.factory, this.repository, input.id, (webhook) => {
      return webhook.update(input);
    });
  }
}
