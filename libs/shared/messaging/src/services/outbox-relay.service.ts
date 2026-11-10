import type { Clock } from '@toxictoast/shared-kernel';
import {
  OutboxSchema,
  type AdvisoryLock,
  type OutboxRow,
} from '@toxictoast/shared-persistence';
import type { PollingResult, PollingTask } from '@toxictoast/shared-system';
import { In, type EntityManager } from 'typeorm';
import {
  EMPTY_OUTBOX_RELAY_RESULT,
  OUTBOX_RELAY_LOCK,
} from '../constants/index.js';
import type {
  EventPublisher,
  OutboxRelayResult,
  PublishedEvent,
} from '../interfaces/index.js';

export class OutboxRelay implements PollingTask {
  constructor(
    private readonly lock: AdvisoryLock,
    private readonly publisher: EventPublisher,
    private readonly clock: Clock,
    readonly batchSize = 100,
  ) {}

  async run(): Promise<PollingResult> {
    const result = await this.relay();
    return { processed: result.published, error: result.error };
  }

  relay(): Promise<OutboxRelayResult> {
    return this.lock.runExclusive(
      OUTBOX_RELAY_LOCK,
      (manager) => this.relayBatch(manager),
      EMPTY_OUTBOX_RELAY_RESULT,
    );
  }

  private async relayBatch(manager: EntityManager): Promise<OutboxRelayResult> {
    const outbox = manager.getRepository(OutboxSchema);
    const rows = await outbox
      .createQueryBuilder('o')
      .where('o.published_at IS NULL')
      .orderBy('o.occurred_at', 'ASC')
      .addOrderBy('o.event_id', 'ASC')
      .limit(this.batchSize)
      .getMany();
    if (rows.length === 0) {
      return EMPTY_OUTBOX_RELAY_RESULT;
    }

    const ids = rows.map((row) => row.event_id);
    try {
      await this.publisher.publish(rows.map((row) => this.toEvent(row)));
    } catch (error) {
      await outbox.increment({ event_id: In(ids) }, 'attempts', 1);
      return { published: 0, failed: rows.length, error };
    }

    await outbox.update(
      { event_id: In(ids) },
      { published_at: this.clock.now() },
    );
    return { published: rows.length, failed: 0, error: null };
  }

  private toEvent(row: OutboxRow): PublishedEvent {
    return {
      event_id: row.event_id,
      event_namespace: row.event_namespace,
      event_name: row.event_name,
      event_version: row.event_version,
      aggregate_id: row.aggregate_id,
      occurred_at: row.occurred_at,
      actor: { type: row.actor_type, id: row.actor_id, ip: row.actor_ip },
      correlation_id: row.correlation_id,
      payload: row.payload,
    };
  }
}
