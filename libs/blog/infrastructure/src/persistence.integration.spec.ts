import { randomUUID } from 'node:crypto';
import type { TagAnemic, TagId } from '@toxictoast/blog-domain';
import type { DomainEvent } from '@toxictoast/shared-kernel';
import {
  TypeOrmOutbox,
  TypeOrmUnitOfWork,
} from '@toxictoast/shared-persistence';
import { TypeOrmTagRepository } from './repositories/index.js';
import { PostgresTestDatabase } from './testing/index.js';
import { ActorContext } from '@toxictoast/shared-system';

const NOW = new Date('2026-10-20T10:00:00Z');

const tag = (): TagAnemic => {
  const id = randomUUID();
  return {
    id: id as TagId,
    title: 'Warhammer',
    slug: `warhammer-${id}`,
    created_at: NOW,
    updated_at: null,
    deleted_at: null,
  };
};

const created = (anemic: TagAnemic): DomainEvent<TagAnemic> => {
  return {
    event_id: randomUUID(),
    event_namespace: 'blog.tag',
    event_name: 'create',
    event_version: 1,
    aggregate_id: anemic.id,
    occurred_at: NOW,
    payload: anemic,
  };
};

describe('Blog persistence', () => {
  const database = new PostgresTestDatabase();
  let uow: TypeOrmUnitOfWork;
  let outbox: TypeOrmOutbox;
  let tags: TypeOrmTagRepository;

  beforeAll(async () => {
    await database.start();
    uow = new TypeOrmUnitOfWork(database.dataSource, database.context);
    outbox = new TypeOrmOutbox(database.context, new ActorContext());
    tags = new TypeOrmTagRepository(database.dataSource, database.context);
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('has migrations that match the schemas', async () => {
    const sql = await database.dataSource.driver.createSchemaBuilder().log();

    expect(sql.upQueries).toEqual([]);
  });

  it('writes the entity and its event in one transaction', async () => {
    const anemic = tag();

    await uow.run(async () => {
      await tags.save(anemic);
      await outbox.add([created(anemic)]);
    });

    const rows = await database.dataSource.query(
      'SELECT event_name, aggregate_id, actor_type, actor_id, actor_ip, payload, published_at FROM outbox',
    );
    expect(await tags.findById(anemic.id)).toEqual(anemic);
    expect(rows).toEqual([
      {
        event_name: 'create',
        aggregate_id: anemic.id,
        actor_type: 'system',
        actor_id: null,
        actor_ip: null,
        payload: { ...anemic, created_at: NOW.toISOString() },
        published_at: null,
      },
    ]);
  });

  it('rolls back the entity and its event together', async () => {
    const anemic = tag();

    const work = uow.run(async () => {
      await tags.save(anemic);
      await outbox.add([created(anemic)]);
      throw new Error('boom');
    });

    await expect(work).rejects.toThrow('boom');
    expect(await tags.findById(anemic.id, true)).toBeNull();
    expect(await database.dataSource.query('SELECT 1 FROM outbox')).toEqual([]);
  });
});
