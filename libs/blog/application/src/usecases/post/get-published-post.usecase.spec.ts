import { PostStatus } from '@toxictoast/blog-domain';
import {
  InMemoryPostRepository,
  postAnemic,
  TEST_NOW,
} from '../../testing/index.js';
import { GetPublishedPostUseCase } from './get-published-post.usecase.js';

describe('GetPublishedPostUseCase', () => {
  let posts: InMemoryPostRepository;
  let useCase: GetPublishedPostUseCase;

  beforeEach(() => {
    posts = new InMemoryPostRepository();
    useCase = new GetPublishedPostUseCase(posts);
  });

  it('returns a published post by slug', async () => {
    await posts.save(postAnemic('warhammer', { status: PostStatus.PUBLISHED }));

    const result = await useCase.execute({ slug: 'warhammer' });

    expect(result.isSuccess).toBe(true);
    expect(result.value.slug).toBe('warhammer');
  });

  it.each([
    ['a draft', { status: PostStatus.DRAFT }],
    ['an archived post', { status: PostStatus.ARCHIVED }],
    ['a deleted post', { status: PostStatus.PUBLISHED, deleted_at: TEST_NOW }],
  ])('hides %s', async (_, overrides) => {
    await posts.save(postAnemic('warhammer', overrides));

    const result = await useCase.execute({ slug: 'warhammer' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('fails on an unknown slug', async () => {
    const result = await useCase.execute({ slug: 'unknown' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
