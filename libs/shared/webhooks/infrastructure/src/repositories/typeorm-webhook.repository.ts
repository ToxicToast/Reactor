import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { SecretCipher } from '@toxictoast/shared-system';
import {
  matchesEventKey,
  type WebhookAnemic,
  type WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import type { DataSource } from 'typeorm';
import type { WebhookRow } from '../interfaces/index.js';
import { WebhookMapper } from '../mappers/index.js';
import { WebhookSchema } from '../schemas/index.js';

export class TypeOrmWebhookRepository
  extends TypeOrmRepository<WebhookAnemic, WebhookRow>
  implements WebhookRepository
{
  constructor(
    dataSource: DataSource,
    context: TransactionContext,
    cipher: SecretCipher,
  ) {
    super(dataSource, context, WebhookSchema, new WebhookMapper(cipher));
  }

  async findActiveForEvent(eventKey: string): Promise<Array<WebhookAnemic>> {
    const active = await this.many(this.query().andWhere('e.active = true'));
    return active.filter((webhook) => {
      return matchesEventKey(webhook.events, eventKey);
    });
  }
}
