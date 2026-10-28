import type { Repository } from '@toxictoast/shared-kernel';
import type { Chainable } from '@toxictoast/shared-types';
import type { WebhookAnemic } from '../anemics/index.js';

interface AdditionalMethods {
  findActiveForEvent(eventKey: string): Promise<Array<WebhookAnemic>>;
}

export type WebhookRepository = Chainable<
  Repository<WebhookAnemic>,
  AdditionalMethods
>;
