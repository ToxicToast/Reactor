import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  WebhookDeliveryAnemic,
  WebhookDeliveryFactory,
  WebhookDeliveryRepository,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import type { WebhookEvent } from '../interfaces/index.js';

export class DispatchWebhookEventUseCase implements UseCase<
  WebhookEvent,
  number
> {
  constructor(
    private readonly factory: WebhookDeliveryFactory,
    private readonly webhooks: WebhookRepository,
    private readonly deliveries: WebhookDeliveryRepository,
  ) {}

  async execute(event: WebhookEvent): Promise<Result<number>> {
    const webhooks = await this.webhooks.findActiveForEvent(event.event_key);
    if (webhooks.length === 0) {
      return Result.ok(0);
    }

    const deliveries: Array<WebhookDeliveryAnemic> = [];
    for (const webhook of webhooks) {
      const created = this.factory.createDomain({
        webhook_id: webhook.id,
        ...event,
      });
      if (created.isFailure) {
        return Result.fail(created.error);
      }
      deliveries.push(this.factory.constitute(created.value));
    }

    await this.deliveries.enqueue(deliveries);
    return Result.ok(deliveries.length);
  }
}
