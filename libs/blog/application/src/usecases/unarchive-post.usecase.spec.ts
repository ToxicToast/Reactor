import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { PostFactory, PostStatus, type PostId } from '@toxictoast/blog-domain';
import {
  createTestContext,
  InMemoryPostRepository,
  postAnemic,
} from '../testing/index.js';
import { UnarchivePostUseCase } from './unarchive-post.usecase.js';

const ID = 'post-1' as PostId;
const PAST = new Date('2024-05-01T08:00:00Z');

describe('UnarchivePostUseCase', () => {
  let posts: InMemoryPostRepository;
  let outbox: InMemoryOutbox;
  let useCase: UnarchivePostUseCase;

  beforeEach(() => {
    posts = new InMemoryPostRepository();
    outbox = new InMemoryOutbox();
    useCase = new UnarchivePostUseCase(
      new PostFactory(createTestContext()),
      posts,
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
    );
  });

  it('unarchives and keeps the original published date', async () => {
    await posts.save(
      postAnemic('post-1', {
        status: PostStatus.ARCHIVED,
        published_at: PAST,
      }),
    );

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      status: PostStatus.PUBLISHED,
      published_at: PAST,
    });
    expect(outbox.events.map((e) => e.event_name)).toEqual(['unarchive']);
  });

  it('refuses a post that is not archived', async () => {
    await posts.save(postAnemic('post-1', { status: PostStatus.PUBLISHED }));

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });
});
