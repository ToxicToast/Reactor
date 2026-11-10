import type { Anemic } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { WebhookId } from '../types/index.js';

export interface WebhookAnemic extends Anemic<WebhookId> {
  readonly url: string;
  readonly events: ReadonlyArray<string>;
  readonly description: Nullable<string>;
  readonly active: boolean;
  readonly format: string;
  readonly secret: string;
}
