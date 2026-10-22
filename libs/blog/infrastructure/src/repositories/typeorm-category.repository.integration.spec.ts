import { randomUUID } from 'node:crypto';
import type { CategoryAnemic, CategoryId } from '@toxictoast/blog-domain';
import { PostgresTestDatabase } from '../testing/index.js';
import { TypeOrmCategoryRepository } from './typeorm-category.repository.js';

const NOW = new Date('2026-10-20T10:00:00Z');

const category = (overrides: Partial<CategoryAnemic> = {}): CategoryAnemic => {
  const id = randomUUID();
  return {
    id: id as CategoryId,
    title: 'Warhammer',
    slug: `warhammer-${id}`,
    description: null,
    parent_id: null,
    created_at: NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};

describe('TypeOrmCategoryRepository', () => {
  const database = new PostgresTestDatabase();
  let categories: TypeOrmCategoryRepository;

  beforeAll(async () => {
    await database.start();
    categories = new TypeOrmCategoryRepository(
      database.dataSource,
      database.context,
    );
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('saves and loads a category with parent and description', async () => {
    const parent = category();
    const child = category({
      parent_id: parent.id,
      description: 'Die Engel des Todes',
    });
    await categories.save(parent);
    await categories.save(child);

    expect(await categories.findById(child.id)).toEqual(child);
  });

  it('finds only active children of the parent', async () => {
    const parent = category();
    const other = category();
    const child = category({ parent_id: parent.id });
    await categories.save(parent);
    await categories.save(other);
    await categories.save(child);
    await categories.save(category({ parent_id: parent.id, deleted_at: NOW }));
    await categories.save(category({ parent_id: other.id }));

    expect(await categories.findChildren(parent.id)).toEqual([child]);
  });

  it('finds by slug and by ids', async () => {
    const anemic = category({ slug: 'space-marines' });
    await categories.save(anemic);

    expect(await categories.findBySlug('space-marines')).toEqual(anemic);
    expect(await categories.findByIds([anemic.id])).toEqual([anemic]);
  });
});
