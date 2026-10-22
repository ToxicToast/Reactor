import type { Clock } from '@toxictoast/shared-kernel';
import { OutboxSchema, type OutboxRow } from '@toxictoast/shared-persistence';
import { In, type DataSource, type EntityManager } from 'typeorm';
import type {
  EventPublisher,
  OutboxRelayResult,
  PublishedEvent,
} from '../interfaces/index.js';

export class OutboxRelay {
  constructor(
    private readonly dataSource: DataSource,
    private readonly publisher: EventPublisher,
    private readonly clock: Clock,
    readonly batchSize = 100,
  ) {}

  relay(): Promise<OutboxRelayResult> {
    return this.dataSource.transaction((manager) => this.relayBatch(manager));
  }

  private async relayBatch(manager: EntityManager): Promise<OutboxRelayResult> {
    const lock: Array<{ locked: boolean }> = await manager.query(
      `SELECT pg_try_advisory_xact_lock(hashtext('outbox_relay')) AS locked`,
    );
    if (!lock[0]?.locked) {
      return { published: 0, failed: 0, error: null };
    }

    const outbox = manager.getRepository(OutboxSchema);
    const rows = await outbox
      .createQueryBuilder('o')
      .where('o.published_at IS NULL')
      .orderBy('o.occurred_at', 'ASC')
      .addOrderBy('o.event_id', 'ASC')
      .limit(this.batchSize)
      .getMany();
    if (rows.length === 0) {
      return { published: 0, failed: 0, error: null };
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
      payload: row.payload,
    };
  }
}
