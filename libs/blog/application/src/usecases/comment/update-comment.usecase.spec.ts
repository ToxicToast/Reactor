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
} from '../../testing/index.js';
import { UpdateCommentUseCase } from './update-comment.usecase.js';

const ID = 'c-1' as CommentId;

describe('UpdateCommentUseCase', () => {
  let comments: InMemoryCommentRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: UpdateCommentUseCase;

  beforeEach(async () => {
    comments = new InMemoryCommentRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new UpdateCommentUseCase(
      new CommentFactory(createTestContext()),
      comments,
      new DomainPersistence(outbox, uow),
    );

    await comments.save(commentAnemic('c-1'));
  });

  it('updates the content', async () => {
    const result = await useCase.execute({ id: ID, content: ' Neu ' });

    expect(result.isSuccess).toBe(true);
    expect(result.value.content).toBe('Neu');
    expect(outbox.events.map((e) => e.event_name)).toEqual(['update']);
  });

  it('does not write when nothing changes', async () => {
    const result = await useCase.execute({
      id: ID,
      content: 'Für den Imperator!',
    });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('fails on empty content', async () => {
    const result = await useCase.execute({ id: ID, content: '' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });

  it('fails when the comment does not exist', async () => {
    const result = await useCase.execute({
      id: 'missing' as CommentId,
      content: 'Neu',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
