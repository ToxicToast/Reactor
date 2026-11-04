import type { Optional } from '@toxictoast/shared-types';
import type { WebhookFormatter } from '@toxictoast/shared-webhooks-application';

export interface WebhooksModuleOptions {
  /** Name der Env-Variable mit dem Schlüssel für die Webhook-Secrets (32 Bytes, base64) */
  readonly secretKeyEnv: string;
  /** zusätzlich zu JSON, das immer verfügbar ist */
  readonly formatters?: Optional<ReadonlyArray<WebhookFormatter>>;
}
