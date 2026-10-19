import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { PostFactory, type PostId } from '@toxictoast/blog-domain';
import {
  createTestContext,
  InMemoryPostRepository,
  postAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { RestorePostUseCase } from './restore-post.usecase.js';

const ID = 'post-1' as PostId;

describe('RestorePostUseCase', () => {
  let posts: InMemoryPostRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: RestorePostUseCase;

  beforeEach(() => {
    posts = new InMemoryPostRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new RestorePostUseCase(
      new PostFactory(createTestContext()),
      posts,
      new DomainPersistence(outbox, uow),
    );
  });

  it('restores a deleted post', async () => {
    await posts.save(postAnemic('post-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(posts.items.get(ID)?.deleted_at).toBeNull();
    expect(outbox.events.map((e) => e.event_name)).toEqual(['restore']);
  });

  it('succeeds without writing when not deleted', async () => {
    await posts.save(postAnemic('post-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });
});
