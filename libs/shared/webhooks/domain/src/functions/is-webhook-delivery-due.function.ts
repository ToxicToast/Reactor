import type { WebhookDeliveryAnemic } from '../anemics/index.js';
import { WebhookDeliveryStatus } from '../constants/index.js';

export const isWebhookDeliveryDue = (
  delivery: Pick<WebhookDeliveryAnemic, 'status' | 'next_attempt_at'>,
  now: Date,
): boolean => {
  return (
    delivery.status === WebhookDeliveryStatus.PENDING &&
    delivery.next_attempt_at !== null &&
    delivery.next_attempt_at <= now
  );
};
