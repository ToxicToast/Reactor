import { randomUUID } from 'node:crypto';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { ActorType, type Clock } from '@toxictoast/shared-kernel';
import { OutboxSchema, type OutboxRow } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import type { EventPublisher, PublishedEvent } from '../interfaces/index.js';
import { OutboxRelay } from './outbox-relay.service.js';

const NOW = new Date('2026-10-20T12:00:00Z');
const clock: Clock = { now: () => NOW };

const row = (minute: number, overrides: Partial<OutboxRow> = {}): OutboxRow => {
  return {
    event_id: randomUUID(),
    event_namespace: 'blog.post',
    event_name: 'update',
    event_version: 1,
    aggregate_id: 'post-1',
    actor_type: ActorType.USER,
    actor_id: 'user-1',
    actor_ip: '203.0.113.7',
    correlation_id: null,
    payload: { minute },
    occurred_at: new Date(
      `2026-10-20T10:${String(minute).padStart(2, '0')}:00Z`,
    ),
    published_at: null,
    attempts: 0,
    ...overrides,
  };
};

class RecordingPublisher implements EventPublisher {
  readonly published: Array<PublishedEvent> = [];

  async publish(events: ReadonlyArray<PublishedEvent>): Promise<void> {
    this.published.push(...events);
  }
}

describe('OutboxRelay', () => {
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:18-alpine').start();
    dataSource = new DataSource({
      type: 'postgres',
      url: container.getConnectionUri(),
      entities: [OutboxSchema],
      synchronize: true,
    });
    await dataSource.initialize();
  });

  afterEach(() => dataSource.query('TRUNCATE outbox'));

  afterAll(async () => {
    await dataSource.destroy();
    await container.stop();
  });

  const insert = (...rows: Array<OutboxRow>): Promise<unknown> => {
    return dataSource.getRepository(OutboxSchema).insert(rows);
  };

  const load = (): Promise<Array<OutboxRow>> => {
    return dataSource
      .getRepository(OutboxSchema)
      .find({ order: { occurred_at: 'ASC' } });
  };

  it('publishes unpublished events in order and marks them', async () => {
    const publisher = new RecordingPublisher();
    await insert(row(3), row(1), row(2), row(0, { published_at: NOW }));

    const result = await new OutboxRelay(dataSource, publisher, clock).relay();

    expect(result).toEqual({ published: 3, failed: 0, error: null });
    expect(publisher.published.map((event) => event.payload)).toEqual([
      { minute: 1 },
      { minute: 2 },
      { minute: 3 },
    ]);
    expect((await load()).every((stored) => stored.published_at)).toBe(true);
  });

  it('publishes the actor of each event', async () => {
    const publisher = new RecordingPublisher();
    await insert(
      row(1),
      row(2, { actor_type: ActorType.SYSTEM, actor_id: null, actor_ip: null }),
    );

    await new OutboxRelay(dataSource, publisher, clock).relay();

    expect(publisher.published.map((event) => event.actor)).toEqual([
      { type: 'user', id: 'user-1', ip: '203.0.113.7' },
      { type: 'system', id: null, ip: null },
    ]);
  });

  it('publishes the correlation id of each event', async () => {
    const publisher = new RecordingPublisher();
    const correlationId = randomUUID();
    await insert(row(1, { correlation_id: correlationId }), row(2));

    await new OutboxRelay(dataSource, publisher, clock).relay();

    expect(publisher.published.map((event) => event.correlation_id)).toEqual([
      correlationId,
      null,
    ]);
  });

  it('does nothing without unpublished events', async () => {
    const publisher = new RecordingPublisher();

    const result = await new OutboxRelay(dataSource, publisher, clock).relay();

    expect(result.published).toBe(0);
    expect(publisher.published).toEqual([]);
  });

  it('respects the batch size', async () => {
    const publisher = new RecordingPublisher();
    await insert(row(1), row(2), row(3));

    await new OutboxRelay(dataSource, publisher, clock, 2).relay();

    expect(publisher.published).toHaveLength(2);
    expect((await load())[2].published_at).toBeNull();
  });

  it('counts attempts and keeps events unpublished on failure', async () => {
    const error = new Error('broker down');
    const failing: EventPublisher = {
      publish: () => Promise.reject(error),
    };
    await insert(row(1), row(2));

    const result = await new OutboxRelay(dataSource, failing, clock).relay();

    expect(result).toEqual({ published: 0, failed: 2, error });
    expect(await load()).toEqual([
      expect.objectContaining({ published_at: null, attempts: 1 }),
      expect.objectContaining({ published_at: null, attempts: 1 }),
    ]);
  });

  it('lets only one relay run at a time', async () => {
    await insert(row(1));
    let started!: () => void;
    let release!: () => void;
    const isStarted = new Promise<void>((resolve) => {
      started = resolve;
    });
    const isReleased = new Promise<void>((resolve) => {
      release = resolve;
    });
    const blocking: EventPublisher = {
      publish: async () => {
        started();
        await isReleased;
      },
    };
    const second = new RecordingPublisher();

    const first = new OutboxRelay(dataSource, blocking, clock).relay();
    await isStarted;
    const skipped = await new OutboxRelay(dataSource, second, clock).relay();
    release();

    expect(skipped.published).toBe(0);
    expect(second.published).toEqual([]);
    expect((await first).published).toBe(1);
  });
});
