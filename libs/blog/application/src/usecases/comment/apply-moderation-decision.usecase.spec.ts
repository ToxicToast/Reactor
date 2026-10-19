import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  CommentFactory,
  CommentModerator,
  CommentStatus,
  type CommentId,
} from '@toxictoast/blog-domain';
import { CommentModerationService } from '../../services/index.js';
import {
  commentAnemic,
  createTestContext,
  InMemoryCommentRepository,
  TEST_NOW,
} from '../../testing/index.js';
import { ApplyModerationDecisionUseCase } from './apply-moderation-decision.usecase.js';

const ID = 'c-1' as CommentId;

describe('ApplyModerationDecisionUseCase', () => {
  let comments: InMemoryCommentRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: ApplyModerationDecisionUseCase;

  beforeEach(() => {
    comments = new InMemoryCommentRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new ApplyModerationDecisionUseCase(
      new CommentFactory(createTestContext()),
      comments,
      new CommentModerationService(),
      new DomainPersistence(outbox, uow),
    );
  });

  it('applies the decision of the AI', async () => {
    await comments.save(commentAnemic('c-1'));

    const result = await useCase.execute({
      id: ID,
      decision: CommentStatus.SPAM,
      note: 'link farm',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      status: CommentStatus.SPAM,
      moderated_by: CommentModerator.AI,
      moderation_note: 'link farm',
    });
    expect(outbox.events.map((e) => e.event_name)).toEqual(['spam']);
  });

  it('keeps the comment pending on review', async () => {
    await comments.save(commentAnemic('c-1'));

    const result = await useCase.execute({ id: ID, decision: 'review' });

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe(CommentStatus.PENDING);
    expect(uow.runs).toBe(0);
  });

  it('ignores the decision when the admin was faster', async () => {
    await comments.save(
      commentAnemic('c-1', {
        status: CommentStatus.APPROVED,
        moderated_by: CommentModerator.ADMIN,
      }),
    );

    const result = await useCase.execute({
      id: ID,
      decision: CommentStatus.HATE,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe(CommentStatus.APPROVED);
    expect(uow.runs).toBe(0);
  });

  it('ignores the decision for a deleted comment', async () => {
    await comments.save(commentAnemic('c-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({
      id: ID,
      decision: CommentStatus.APPROVED,
    });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('fails when the comment does not exist', async () => {
    const result = await useCase.execute({
      id: ID,
      decision: CommentStatus.APPROVED,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
