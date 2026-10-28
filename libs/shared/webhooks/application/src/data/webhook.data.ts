import type { Optional } from '@toxictoast/shared-types';
import type {
  WebhookAnemic,
  WebhookDeliveryStatusValue,
} from '@toxictoast/shared-webhooks-domain';

export interface CreateWebhookInput {
  readonly url: string;
  readonly events: ReadonlyArray<string>;
  readonly description?: Optional<string>;
}

export interface UpdateWebhookInput {
  readonly id: string;
  readonly url: string;
  readonly events: ReadonlyArray<string>;
  readonly description?: Optional<string>;
  readonly active: boolean;
}

export interface WebhookIdInput {
  readonly id: string;
}

export interface WebhookWithSecret {
  readonly webhook: WebhookAnemic;
  readonly secret: string;
}

export interface ListWebhookDeliveriesInput {
  readonly webhook_id: string;
  readonly status?: Optional<WebhookDeliveryStatusValue>;
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
}
