import type { Optional } from '@toxictoast/shared-types';
import type { WebhookFormatter } from '@toxictoast/shared-webhooks-application';

export interface WebhooksModuleOptions {
  readonly secretKeyEnv: string;
  readonly formatters?: Optional<ReadonlyArray<WebhookFormatter>>;
}
