import type { WebhookDeliveryStatus } from '../constants/index.js';

export type WebhookDeliveryStatusValue =
  (typeof WebhookDeliveryStatus)[keyof typeof WebhookDeliveryStatus];
