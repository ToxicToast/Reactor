import type { Outbox } from '@toxictoast/shared-application';
import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { ActorContext } from '@toxictoast/shared-system';
import type { TransactionContext } from '../classes/index.js';
import type { OutboxRow } from '../interfaces/index.js';
import { OutboxSchema } from '../schemas/index.js';

export class TypeOrmOutbox implements Outbox {
  constructor(
    private readonly context: TransactionContext,
    private readonly actors: ActorContext,
  ) {}

  async add(events: ReadonlyArray<DomainEvent>): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const manager = this.context.current();
    if (!manager) {
      throw new Error('Outbox.add must run inside a UnitOfWork');
    }

    const actor = this.actors.current();
    const rows: Array<OutboxRow> = events.map((event) => {
      return {
        event_id: event.event_id,
        event_namespace: event.event_namespace,
        event_name: event.event_name,
        event_version: event.event_version,
        aggregate_id: event.aggregate_id,
        actor_type: actor.type,
        actor_id: actor.id,
        actor_ip: actor.ip,
        payload: event.payload,
        occurred_at: event.occurred_at,
        published_at: null,
        attempts: 0,
      };
    });

    await manager.getRepository(OutboxSchema).insert(rows);
  }
}
