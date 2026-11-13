import type { Optional } from '@toxictoast/shared-types';
import type {
  WebhookAnemic,
  WebhookDeliveryStatusValue,
  WebhookId,
} from '@toxictoast/shared-webhooks-domain';

export interface CreateWebhookInput {
  readonly url: string;
  readonly events: ReadonlyArray<string>;
  readonly description?: Optional<string>;
  readonly format?: Optional<string>;
}

export interface UpdateWebhookInput {
  readonly id: WebhookId;
  readonly url: string;
  readonly events: ReadonlyArray<string>;
  readonly description?: Optional<string>;
  readonly format?: Optional<string>;
  readonly active: boolean;
}

export interface WebhookIdInput {
  readonly id: WebhookId;
}

export interface WebhookWithSecret {
  readonly webhook: WebhookAnemic;
  readonly secret: string;
}

export interface ListWebhookDeliveriesInput {
  readonly webhook_id: WebhookId;
  readonly status?: Optional<WebhookDeliveryStatusValue>;
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
}
