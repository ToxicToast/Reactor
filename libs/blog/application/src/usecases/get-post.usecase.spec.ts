import type { PostId } from '@toxictoast/blog-domain';
import {
  InMemoryPostRepository,
  postAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { GetPostUseCase } from './get-post.usecase.js';

const ID = 'post-1' as PostId;

describe('GetPostUseCase', () => {
  let posts: InMemoryPostRepository;
  let useCase: GetPostUseCase;

  beforeEach(() => {
    posts = new InMemoryPostRepository();
    useCase = new GetPostUseCase(posts);
  });

  it('returns a post in any status', async () => {
    await posts.save(postAnemic('post-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe(ID);
  });

  it('hides a deleted post by default', async () => {
    await posts.save(postAnemic('post-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns a deleted post with withDeleted', async () => {
    await posts.save(postAnemic('post-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID, withDeleted: true });

    expect(result.isSuccess).toBe(true);
  });
});
