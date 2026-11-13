import type { Optional } from '@toxictoast/shared-types';
import type { WebhookFormatter } from '@toxictoast/shared-webhooks-application';

export interface WebhooksModuleOptions {
  /** Präfix der Env-Variablen <PRÄFIX>_KEYS und <PRÄFIX>_KEY_ID für den Schlüsselbund */
  readonly secretKeyEnvPrefix: string;
  /** zusätzlich zu JSON, das immer verfügbar ist */
  readonly formatters?: Optional<ReadonlyArray<WebhookFormatter>>;
}
