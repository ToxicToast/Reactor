import type { Nullable, Optional } from '@toxictoast/shared-types';
import {
  isWebhookActive,
  matchesEventKey,
  type WebhookAnemic,
  type WebhookId,
  type WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import { paginate } from './paginate.function.js';

export class InMemoryWebhookRepository implements WebhookRepository {
  readonly items = new Map<WebhookId, WebhookAnemic>();

  async save(anemic: WebhookAnemic): Promise<WebhookAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset?: Optional<number>,
    withDeleted = false,
  ): Promise<Array<WebhookAnemic>> {
    const webhooks = [...this.items.values()].filter((webhook) => {
      return withDeleted || webhook.deleted_at === null;
    });
    return paginate(webhooks, limit, offset);
  }

  async findById(
    id: WebhookId,
    withDeleted = false,
  ): Promise<Nullable<WebhookAnemic>> {
    const webhook = this.items.get(id) ?? null;
    if (webhook && !withDeleted && webhook.deleted_at !== null) {
      return null;
    }
    return webhook;
  }

  async findActiveForEvent(eventKey: string): Promise<Array<WebhookAnemic>> {
    return [...this.items.values()].filter((webhook) => {
      return (
        isWebhookActive(webhook) && matchesEventKey(webhook.events, eventKey)
      );
    });
  }
}
