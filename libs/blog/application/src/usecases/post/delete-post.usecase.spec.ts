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
} from '../../testing/index.js';
import { DeletePostUseCase } from './delete-post.usecase.js';

const ID = 'post-1' as PostId;

describe('DeletePostUseCase', () => {
  let posts: InMemoryPostRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: DeletePostUseCase;

  beforeEach(() => {
    posts = new InMemoryPostRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new DeletePostUseCase(
      new PostFactory(createTestContext()),
      posts,
      new DomainPersistence(outbox, uow),
    );
  });

  it('soft-deletes the post', async () => {
    await posts.save(postAnemic('post-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(posts.items.get(ID)?.deleted_at).toEqual(TEST_NOW);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['delete']);
  });

  it('succeeds without writing when already deleted', async () => {
    await posts.save(postAnemic('post-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('fails when the post does not exist', async () => {
    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
