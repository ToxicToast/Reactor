import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { CommentFactory, type CommentId } from '@toxictoast/blog-domain';
import {
  commentAnemic,
  createTestContext,
  InMemoryCommentRepository,
  TEST_NOW,
} from '../../testing/index.js';
import { RestoreCommentUseCase } from './restore-comment.usecase.js';

const ID = 'c-1' as CommentId;

describe('RestoreCommentUseCase', () => {
  let comments: InMemoryCommentRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: RestoreCommentUseCase;

  beforeEach(() => {
    comments = new InMemoryCommentRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new RestoreCommentUseCase(
      new CommentFactory(createTestContext()),
      comments,
      new DomainPersistence(outbox, uow),
    );
  });

  it('restores a deleted comment', async () => {
    await comments.save(commentAnemic('c-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(comments.items.get(ID)?.deleted_at).toBeNull();
    expect(outbox.events.map((e) => e.event_name)).toEqual(['restore']);
  });

  it('succeeds without writing when not deleted', async () => {
    await comments.save(commentAnemic('c-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });
});
