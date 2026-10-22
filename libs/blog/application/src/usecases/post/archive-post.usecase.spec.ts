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
} from '../../testing/index.js';
import { ArchivePostUseCase } from './archive-post.usecase.js';

const ID = 'post-1' as PostId;

describe('ArchivePostUseCase', () => {
  let posts: InMemoryPostRepository;
  let outbox: InMemoryOutbox;
  let useCase: ArchivePostUseCase;

  beforeEach(() => {
    posts = new InMemoryPostRepository();
    outbox = new InMemoryOutbox();
    useCase = new ArchivePostUseCase(
      new PostFactory(createTestContext()),
      posts,
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
    );
  });

  it('archives a published post', async () => {
    await posts.save(postAnemic('post-1', { status: PostStatus.PUBLISHED }));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe(PostStatus.ARCHIVED);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['archive']);
  });

  it('refuses to archive a draft', async () => {
    await posts.save(postAnemic('post-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('fails when the post does not exist', async () => {
    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
