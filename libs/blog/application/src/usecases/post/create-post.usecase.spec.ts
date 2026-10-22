import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  PostFactory,
  PostStatus,
  type AuthorId,
  type CategoryId,
  type PostData,
} from '@toxictoast/blog-domain';
import { PostReferencesService } from '../../services/index.js';
import {
  categoryAnemic,
  createTestContext,
  InMemoryCategoryRepository,
  InMemoryMediaRepository,
  InMemoryPostRepository,
  InMemoryTagRepository,
  postAnemic,
  TEST_NOW,
} from '../../testing/index.js';
import { CreatePostUseCase } from './create-post.usecase.js';

const DATA: PostData = {
  author_id: 'author-1' as AuthorId,
  title: 'Warhammer 40k',
  excerpt: null,
  content: 'Inhalt',
  featured: false,
  category_ids: [],
  tag_ids: [],
  blog_image_id: null,
  hero_image_id: null,
};

describe('CreatePostUseCase', () => {
  let posts: InMemoryPostRepository;
  let categories: InMemoryCategoryRepository;
  let outbox: InMemoryOutbox;
  let useCase: CreatePostUseCase;

  beforeEach(() => {
    posts = new InMemoryPostRepository();
    categories = new InMemoryCategoryRepository();
    outbox = new InMemoryOutbox();
    useCase = new CreatePostUseCase(
      new PostFactory(createTestContext()),
      posts,
      new PostReferencesService(
        categories,
        new InMemoryTagRepository(),
        new InMemoryMediaRepository(),
      ),
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
    );
  });

  it('creates a draft and writes the event', async () => {
    const result = await useCase.execute(DATA);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      slug: 'warhammer-40k',
      status: PostStatus.DRAFT,
    });
    expect(posts.items.size).toBe(1);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['create']);
  });

  it('creates a post with existing categories', async () => {
    await categories.save(categoryAnemic('cat-1'));

    const result = await useCase.execute({
      ...DATA,
      category_ids: ['cat-1' as CategoryId],
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.category_ids).toEqual(['cat-1']);
  });

  it('fails on a missing category without storing', async () => {
    const result = await useCase.execute({
      ...DATA,
      category_ids: ['missing' as CategoryId],
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
    expect(posts.items.size).toBe(0);
  });

  it('fails when the slug exists, even if deleted', async () => {
    await posts.save(postAnemic('warhammer-40k', { deleted_at: TEST_NOW }));

    const result = await useCase.execute(DATA);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('fails on an invalid title', async () => {
    const result = await useCase.execute({ ...DATA, title: '   ' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });
});
