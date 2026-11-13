import type { Repository } from '@toxictoast/shared-kernel';
import type { WebhookAnemic } from '../anemics/index.js';

export interface WebhookRepository extends Repository<WebhookAnemic> {
  findActiveForEvent(eventKey: string): Promise<Array<WebhookAnemic>>;
}
