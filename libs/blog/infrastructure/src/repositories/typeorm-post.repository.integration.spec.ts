import { randomUUID } from 'node:crypto';
import {
  PostStatus,
  type AuthorId,
  type CategoryId,
  type PostAnemic,
  type PostId,
  type TagId,
} from '@toxictoast/blog-domain';
import { TypeOrmUnitOfWork } from '@toxictoast/shared-persistence';
import { BlogTestDatabase } from '../testing/index.js';
import { TypeOrmPostRepository } from './typeorm-post.repository.js';

const NOW = new Date('2026-10-20T10:00:00Z');
const CAT_A = randomUUID() as CategoryId;
const CAT_B = randomUUID() as CategoryId;
const TAG_A = randomUUID() as TagId;

const post = (overrides: Partial<PostAnemic> = {}): PostAnemic => {
  const id = randomUUID();
  return {
    id: id as PostId,
    author_id: randomUUID() as AuthorId,
    title: 'Warhammer 40k',
    slug: `warhammer-${id}`,
    excerpt: null,
    content: 'Es gibt nur Krieg.',
    status: PostStatus.DRAFT,
    featured: false,
    reading_time: 1,
    category_ids: [],
    tag_ids: [],
    blog_image_id: null,
    hero_image_id: null,
    published_at: null,
    created_at: NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};

describe('TypeOrmPostRepository', () => {
  const database = new BlogTestDatabase();
  let posts: TypeOrmPostRepository;
  let uow: TypeOrmUnitOfWork;

  beforeAll(async () => {
    await database.start();
    posts = new TypeOrmPostRepository(database.dataSource, database.context);
    uow = new TypeOrmUnitOfWork(database.dataSource, database.context);
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('saves and loads a post with ordered categories and tags', async () => {
    const anemic = post({
      status: PostStatus.PUBLISHED,
      published_at: NOW,
      excerpt: 'Im grimmigen Dunkel',
      blog_image_id: randomUUID() as PostAnemic['blog_image_id'],
      category_ids: [CAT_B, CAT_A],
      tag_ids: [TAG_A],
    });

    await posts.save(anemic);

    expect(await posts.findById(anemic.id)).toEqual(anemic);
  });

  it('replaces categories and tags on save', async () => {
    const anemic = post({ category_ids: [CAT_A, CAT_B], tag_ids: [TAG_A] });
    await posts.save(anemic);

    await posts.save({ ...anemic, category_ids: [CAT_B], tag_ids: [] });

    const loaded = await posts.findById(anemic.id);
    expect(loaded?.category_ids).toEqual([CAT_B]);
    expect(loaded?.tag_ids).toEqual([]);
  });

  it('finds by slug', async () => {
    const anemic = post({ slug: 'warhammer' });
    await posts.save(anemic);

    expect(await posts.findBySlug('warhammer')).toEqual(anemic);
  });

  it('finds by status without deleted ones', async () => {
    const published = post({ status: PostStatus.PUBLISHED });
    await posts.save(published);
    await posts.save(post());
    await posts.save(post({ status: PostStatus.PUBLISHED, deleted_at: NOW }));

    expect(await posts.findByFilter({ status: PostStatus.PUBLISHED })).toEqual([
      published,
    ]);
  });

  it('finds by category and by tag', async () => {
    const both = post({ category_ids: [CAT_A], tag_ids: [TAG_A] });
    const other = post({ category_ids: [CAT_B] });
    await posts.save(both);
    await posts.save(other);

    expect(await posts.findByFilter({ category_id: CAT_A })).toEqual([both]);
    expect(await posts.findByFilter({ tag_id: TAG_A })).toEqual([both]);
  });

  it('combines status, category and tag in one query', async () => {
    const match = post({
      status: PostStatus.PUBLISHED,
      category_ids: [CAT_A],
      tag_ids: [TAG_A],
    });
    await posts.save(match);
    await posts.save(post({ category_ids: [CAT_A], tag_ids: [TAG_A] }));
    await posts.save(
      post({ status: PostStatus.PUBLISHED, category_ids: [CAT_A] }),
    );

    const found = await posts.findByFilter({
      status: PostStatus.PUBLISHED,
      category_id: CAT_A,
      tag_id: TAG_A,
    });

    expect(found).toEqual([match]);
  });

  it('pages after filtering', async () => {
    const oldest = post({
      status: PostStatus.PUBLISHED,
      category_ids: [CAT_A, CAT_B],
      created_at: new Date('2026-10-01T00:00:00Z'),
    });
    await posts.save(oldest);
    await posts.save(
      post({
        category_ids: [CAT_A],
        created_at: new Date('2026-10-02T00:00:00Z'),
      }),
    );
    const newest = post({
      status: PostStatus.PUBLISHED,
      category_ids: [CAT_A, CAT_B],
      created_at: new Date('2026-10-03T00:00:00Z'),
    });
    await posts.save(newest);

    const filter = { status: PostStatus.PUBLISHED, category_id: CAT_A };

    expect(await posts.findByFilter(filter, 1, 0)).toEqual([newest]);
    expect(await posts.findByFilter(filter, 1, 1)).toEqual([oldest]);
  });

  it('rolls back post and links when the unit of work fails', async () => {
    const anemic = post({ category_ids: [CAT_A] });

    const work = uow.run(async () => {
      await posts.save(anemic);
      throw new Error('boom');
    });

    await expect(work).rejects.toThrow('boom');
    expect(await posts.findById(anemic.id, true)).toBeNull();
    expect(
      await database.dataSource.query('SELECT 1 FROM post_categories'),
    ).toEqual([]);
  });
});
