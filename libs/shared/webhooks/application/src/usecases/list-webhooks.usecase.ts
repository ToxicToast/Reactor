import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  WebhookAnemic,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';

export class ListWebhooksUseCase implements UseCase<
  void,
  Array<WebhookAnemic>
> {
  constructor(private readonly repository: WebhookRepository) {}

  async execute(): Promise<Result<Array<WebhookAnemic>>> {
    return Result.ok(await this.repository.findList());
  }
}
