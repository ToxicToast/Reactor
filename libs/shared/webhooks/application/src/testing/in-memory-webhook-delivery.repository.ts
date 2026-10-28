import type { Optional } from '@toxictoast/shared-types';
import {
  isWebhookDeliveryDue,
  type WebhookDeliveryAnemic,
  type WebhookDeliveryRepository,
  type WebhookDeliveryStatusValue,
  type WebhookId,
} from '@toxictoast/shared-webhooks-domain';
import { paginate } from './paginate.function.js';

export class InMemoryWebhookDeliveryRepository implements WebhookDeliveryRepository {
  readonly items: Array<WebhookDeliveryAnemic> = [];

  async enqueue(
    deliveries: ReadonlyArray<WebhookDeliveryAnemic>,
  ): Promise<void> {
    for (const delivery of deliveries) {
      const duplicate = this.items.some((item) => {
        return (
          item.webhook_id === delivery.webhook_id &&
          item.event_id === delivery.event_id
        );
      });
      if (!duplicate) {
        this.items.push(delivery);
      }
    }
  }

  async save(delivery: WebhookDeliveryAnemic): Promise<WebhookDeliveryAnemic> {
    const index = this.items.findIndex((item) => item.id === delivery.id);
    if (index === -1) {
      this.items.push(delivery);
    } else {
      this.items[index] = delivery;
    }
    return delivery;
  }

  async findDue(
    now: Date,
    limit: number,
  ): Promise<Array<WebhookDeliveryAnemic>> {
    const due = this.items.filter((delivery) => {
      return isWebhookDeliveryDue(delivery, now);
    });
    return paginate(due, limit);
  }

  async findByWebhook(
    webhookId: WebhookId,
    status?: Optional<WebhookDeliveryStatusValue>,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<WebhookDeliveryAnemic>> {
    const deliveries = this.items.filter((delivery) => {
      return (
        delivery.webhook_id === webhookId &&
        (status === undefined || delivery.status === status)
      );
    });
    return paginate(deliveries, limit, offset);
  }
}
