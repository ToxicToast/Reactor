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
  TEST_NOW,
} from '../../testing/index.js';
import { PublishPostUseCase } from './publish-post.usecase.js';

const ID = 'post-1' as PostId;
const PAST = new Date('2024-05-01T08:00:00Z');
const FUTURE = new Date('2027-01-01T00:00:00Z');

describe('PublishPostUseCase', () => {
  let posts: InMemoryPostRepository;
  let outbox: InMemoryOutbox;
  let useCase: PublishPostUseCase;

  beforeEach(async () => {
    posts = new InMemoryPostRepository();
    outbox = new InMemoryOutbox();
    useCase = new PublishPostUseCase(
      new PostFactory(createTestContext()),
      posts,
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
    );

    await posts.save(postAnemic('post-1'));
  });

  it('publishes a draft now', async () => {
    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      status: PostStatus.PUBLISHED,
      published_at: TEST_NOW,
    });
    expect(outbox.events.map((e) => e.event_name)).toEqual(['publish']);
  });

  it('publishes backdated', async () => {
    const result = await useCase.execute({ id: ID, published_at: PAST });

    expect(result.value.published_at).toEqual(PAST);
  });

  it('refuses a date in the future', async () => {
    const result = await useCase.execute({ id: ID, published_at: FUTURE });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });

  it('refuses an already published post', async () => {
    await posts.save(postAnemic('post-1', { status: PostStatus.PUBLISHED }));

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('fails when the post does not exist', async () => {
    const result = await useCase.execute({ id: 'missing' as PostId });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
