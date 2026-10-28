import {
  Result,
  type DomainContext,
  type Factory,
} from '@toxictoast/shared-kernel';
import type { WebhookAnemic } from '../anemics/index.js';
import { WebhookFormats } from '../constants/index.js';
import type { CreateWebhookData } from '../data/index.js';
import { WebhookDomain } from '../domains/index.js';
import {
  normalizeWebhookData,
  validateWebhookSecret,
} from '../functions/index.js';

export class WebhookFactory implements Factory<
  WebhookAnemic,
  WebhookDomain,
  CreateWebhookData
> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: WebhookAnemic): WebhookDomain {
    return new WebhookDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: WebhookDomain): WebhookAnemic {
    return domain.toAnemic();
  }

  createDomain(data: CreateWebhookData): Result<WebhookDomain> {
    const normalized = normalizeWebhookData(data);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }
    const secret = validateWebhookSecret(data.secret);
    if (secret.isFailure) {
      return Result.fail(secret.error);
    }

    return Result.ok(
      new WebhookDomain(
        {
          id: this.ctx.id.generate<'Webhook'>(),
          ...normalized.value,
          active: true,
          format: WebhookFormats.JSON,
          secret: data.secret,
          created_at: this.ctx.date.now(),
          updated_at: null,
          deleted_at: null,
        },
        this.ctx,
      ),
    );
  }
}
