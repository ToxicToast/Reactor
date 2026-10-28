import {
  Result,
  type DomainContext,
  type Factory,
} from '@toxictoast/shared-kernel';
import type { WebhookDeliveryAnemic } from '../anemics/index.js';
import { WebhookDeliveryStatus } from '../constants/index.js';
import type { WebhookDeliveryData } from '../data/index.js';
import { WebhookDeliveryDomain } from '../domains/index.js';

export class WebhookDeliveryFactory implements Factory<
  WebhookDeliveryAnemic,
  WebhookDeliveryDomain,
  WebhookDeliveryData
> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: WebhookDeliveryAnemic): WebhookDeliveryDomain {
    return new WebhookDeliveryDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: WebhookDeliveryDomain): WebhookDeliveryAnemic {
    return domain.toAnemic();
  }

  createDomain(data: WebhookDeliveryData): Result<WebhookDeliveryDomain> {
    const now = this.ctx.date.now();
    return Result.ok(
      new WebhookDeliveryDomain(
        {
          id: this.ctx.id.generate<'WebhookDelivery'>(),
          ...data,
          status: WebhookDeliveryStatus.PENDING,
          attempts: 0,
          last_status_code: null,
          last_error: null,
          next_attempt_at: now,
          delivered_at: null,
          created_at: now,
          updated_at: null,
          deleted_at: null,
        },
        this.ctx,
      ),
    );
  }
}
