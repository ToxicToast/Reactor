import { WEBHOOK_HTTP } from '../constants/index.js';
import type {
  WebhookRequest,
  WebhookResponse,
  WebhookSender,
} from '../interfaces/index.js';

export class FetchWebhookSender implements WebhookSender {
  constructor(private readonly timeoutMs: number = WEBHOOK_HTTP.TIMEOUT_MS) {}

  async send(request: WebhookRequest): Promise<WebhookResponse> {
    const response = await fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      redirect: 'manual',
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    await response.body?.cancel();
    return { status_code: response.status };
  }
}
