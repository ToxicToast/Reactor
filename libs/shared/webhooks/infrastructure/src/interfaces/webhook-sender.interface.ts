import type { WebhookRequest } from './webhook-request.interface.js';
import type { WebhookResponse } from './webhook-response.interface.js';

export interface WebhookSender {
  send(request: WebhookRequest): Promise<WebhookResponse>;
}
