import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Optional } from '@toxictoast/shared-types';
import {
  WebhookDeliveryStatus,
  type WebhookDeliveryAnemic,
  type WebhookDeliveryRepository,
  type WebhookDeliveryStatusValue,
  type WebhookId,
} from '@toxictoast/shared-webhooks-domain';
import type { DataSource } from 'typeorm';
import type { WebhookDeliveryRow } from '../interfaces/index.js';
import { WebhookDeliveryMapper } from '../mappers/index.js';
import { WebhookDeliverySchema } from '../schemas/index.js';

export class TypeOrmWebhookDeliveryRepository
  extends TypeOrmRepository<WebhookDeliveryAnemic, WebhookDeliveryRow>
  implements WebhookDeliveryRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(
      dataSource,
      context,
      WebhookDeliverySchema,
      new WebhookDeliveryMapper(),
    );
  }

  async enqueue(
    deliveries: ReadonlyArray<WebhookDeliveryAnemic>,
  ): Promise<void> {
    if (deliveries.length === 0) {
      return;
    }
    await this.repository()
      .createQueryBuilder()
      .insert()
      .into(WebhookDeliverySchema)
      .values(deliveries.map((delivery) => this.mapper.toRow(delivery)))
      .orIgnore()
      .execute();
  }

  findDue(now: Date, limit: number): Promise<Array<WebhookDeliveryAnemic>> {
    return this.many(
      this.query()
        .andWhere('e.status = :status', {
          status: WebhookDeliveryStatus.PENDING,
        })
        .andWhere('e.next_attempt_at <= :now', { now })
        .orderBy('e.next_attempt_at', 'ASC')
        .take(limit),
    );
  }

  findByWebhook(
    webhookId: WebhookId,
    status?: Optional<WebhookDeliveryStatusValue>,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<WebhookDeliveryAnemic>> {
    const query = this.query().andWhere('e.webhook_id = :webhookId', {
      webhookId,
    });
    if (status !== undefined) {
      query.andWhere('e.status = :status', { status });
    }
    return this.many(
      query.orderBy('e.created_at', 'DESC').take(limit).skip(offset),
    );
  }
}
