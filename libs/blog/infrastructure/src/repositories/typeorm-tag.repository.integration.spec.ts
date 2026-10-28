import { randomUUID } from 'node:crypto';
import type { TagAnemic, TagId } from '@toxictoast/blog-domain';
import { BlogTestDatabase } from '../testing/index.js';
import { TypeOrmTagRepository } from './typeorm-tag.repository.js';

const NOW = new Date('2026-10-20T10:00:00Z');

const tag = (overrides: Partial<TagAnemic> = {}): TagAnemic => {
  const id = randomUUID();
  return {
    id: id as TagId,
    title: 'Warhammer',
    slug: `warhammer-${id}`,
    created_at: NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};

describe('TypeOrmTagRepository', () => {
  const database = new BlogTestDatabase();
  let tags: TypeOrmTagRepository;

  beforeAll(async () => {
    await database.start();
    tags = new TypeOrmTagRepository(database.dataSource, database.context);
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('saves and loads a tag', async () => {
    const anemic = tag();

    await tags.save(anemic);

    expect(await tags.findById(anemic.id)).toEqual(anemic);
  });

  it('updates an existing tag on save', async () => {
    const anemic = tag();
    await tags.save(anemic);

    await tags.save({ ...anemic, title: 'Neu', updated_at: NOW });

    expect((await tags.findById(anemic.id))?.title).toBe('Neu');
    expect(await tags.findList()).toHaveLength(1);
  });

  it('hides deleted tags unless asked for', async () => {
    const anemic = tag({ deleted_at: NOW });
    await tags.save(anemic);

    expect(await tags.findById(anemic.id)).toBeNull();
    expect(await tags.findById(anemic.id, true)).toEqual(anemic);
  });

  it('finds by slug, deleted ones only on request', async () => {
    const anemic = tag({ slug: 'warhammer', deleted_at: NOW });
    await tags.save(anemic);

    expect(await tags.findBySlug('warhammer')).toBeNull();
    expect(await tags.findBySlug('warhammer', true)).toEqual(anemic);
  });

  it('finds by ids without missing or deleted ones', async () => {
    const active = tag();
    const deleted = tag({ deleted_at: NOW });
    await tags.save(active);
    await tags.save(deleted);

    const found = await tags.findByIds([
      active.id,
      deleted.id,
      randomUUID() as TagId,
    ]);

    expect(found).toEqual([active]);
    expect(await tags.findByIds([])).toEqual([]);
  });

  it('rejects a duplicate slug', async () => {
    await tags.save(tag({ slug: 'warhammer' }));

    await expect(tags.save(tag({ slug: 'warhammer' }))).rejects.toThrow();
  });

  it('pages the list newest first', async () => {
    const oldest = tag({ created_at: new Date('2026-10-01T00:00:00Z') });
    const middle = tag({ created_at: new Date('2026-10-02T00:00:00Z') });
    const newest = tag({ created_at: new Date('2026-10-03T00:00:00Z') });
    await tags.save(oldest);
    await tags.save(middle);
    await tags.save(newest);

    expect(await tags.findList(1, 1)).toEqual([middle]);
  });
});
