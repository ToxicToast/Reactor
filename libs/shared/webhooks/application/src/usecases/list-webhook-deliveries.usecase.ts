import type { UseCase } from '@toxictoast/shared-application';
import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  WebhookDeliveryAnemic,
  WebhookDeliveryRepository,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import type { ListWebhookDeliveriesInput } from '../data/index.js';

export class ListWebhookDeliveriesUseCase implements UseCase<
  ListWebhookDeliveriesInput,
  Array<WebhookDeliveryAnemic>
> {
  constructor(
    private readonly webhooks: WebhookRepository,
    private readonly deliveries: WebhookDeliveryRepository,
  ) {}

  async execute(
    input: ListWebhookDeliveriesInput,
  ): Promise<Result<Array<WebhookDeliveryAnemic>>> {
    const webhook = await this.webhooks.findById(input.webhook_id, true);
    if (!webhook) {
      return Result.fail(new NotFoundError('Webhook', input.webhook_id));
    }

    return Result.ok(
      await this.deliveries.findByWebhook(
        input.webhook_id,
        input.status,
        input.limit,
        input.offset,
      ),
    );
  }
}
