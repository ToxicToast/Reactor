import type { WebhookAnemic } from '../anemics/index.js';

export const isWebhookActive = (
  webhook: Pick<WebhookAnemic, 'active' | 'deleted_at'>,
): boolean => {
  return webhook.active && webhook.deleted_at === null;
};
