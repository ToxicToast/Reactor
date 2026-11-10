import type {
  WebhookRequest,
  WebhookResponse,
  WebhookSender,
} from '../interfaces/index.js';

export class RecordingWebhookSender implements WebhookSender {
  readonly requests: Array<WebhookRequest> = [];
  respond: (request: WebhookRequest) => Promise<WebhookResponse> = async () => {
    return { status_code: 204 };
  };

  send(request: WebhookRequest): Promise<WebhookResponse> {
    this.requests.push(request);
    return this.respond(request);
  }
}
