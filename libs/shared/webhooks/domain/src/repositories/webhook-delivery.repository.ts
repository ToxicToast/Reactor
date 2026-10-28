import type { Optional } from '@toxictoast/shared-types';
import type { WebhookDeliveryAnemic } from '../anemics/index.js';
import type { WebhookDeliveryStatusValue, WebhookId } from '../types/index.js';

export interface WebhookDeliveryRepository {
  enqueue(deliveries: ReadonlyArray<WebhookDeliveryAnemic>): Promise<void>;
  save(delivery: WebhookDeliveryAnemic): Promise<WebhookDeliveryAnemic>;
  findDue(now: Date, limit: number): Promise<Array<WebhookDeliveryAnemic>>;
  findByWebhook(
    webhookId: WebhookId,
    status?: Optional<WebhookDeliveryStatusValue>,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<WebhookDeliveryAnemic>>;
}
