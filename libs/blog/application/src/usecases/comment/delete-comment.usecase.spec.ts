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
import { DeleteCommentUseCase } from './delete-comment.usecase.js';

const ID = 'c-1' as CommentId;

describe('DeleteCommentUseCase', () => {
  let comments: InMemoryCommentRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: DeleteCommentUseCase;

  beforeEach(() => {
    comments = new InMemoryCommentRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new DeleteCommentUseCase(
      new CommentFactory(createTestContext()),
      comments,
      new DomainPersistence(outbox, uow),
    );
  });

  it('soft-deletes the comment', async () => {
    await comments.save(commentAnemic('c-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(comments.items.get(ID)?.deleted_at).toEqual(TEST_NOW);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['delete']);
  });

  it('succeeds without writing when already deleted', async () => {
    await comments.save(commentAnemic('c-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('fails when the comment does not exist', async () => {
    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
