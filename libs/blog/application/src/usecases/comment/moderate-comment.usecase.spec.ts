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
} from '../../testing/index.js';
import { ModerateCommentUseCase } from './moderate-comment.usecase.js';

const ID = 'c-1' as CommentId;

describe('ModerateCommentUseCase', () => {
  let comments: InMemoryCommentRepository;
  let outbox: InMemoryOutbox;
  let useCase: ModerateCommentUseCase;

  beforeEach(() => {
    comments = new InMemoryCommentRepository();
    outbox = new InMemoryOutbox();
    useCase = new ModerateCommentUseCase(
      new CommentFactory(createTestContext()),
      comments,
      new CommentModerationService(),
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
    );
  });

  it('approves a pending comment as admin', async () => {
    await comments.save(commentAnemic('c-1'));

    const result = await useCase.execute({
      id: ID,
      status: CommentStatus.APPROVED,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      status: CommentStatus.APPROVED,
      moderated_by: CommentModerator.ADMIN,
    });
    expect(outbox.events.map((e) => e.event_name)).toEqual(['approve']);
  });

  it('overrides a decision of the AI', async () => {
    await comments.save(
      commentAnemic('c-1', {
        status: CommentStatus.SPAM,
        moderated_by: CommentModerator.AI,
      }),
    );

    const result = await useCase.execute({
      id: ID,
      status: CommentStatus.APPROVED,
      note: 'false positive',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      status: CommentStatus.APPROVED,
      moderated_by: CommentModerator.ADMIN,
      moderation_note: 'false positive',
    });
  });

  it('marks as hate', async () => {
    await comments.save(commentAnemic('c-1'));

    const result = await useCase.execute({
      id: ID,
      status: CommentStatus.HATE,
    });

    expect(result.value.status).toBe(CommentStatus.HATE);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['hate']);
  });

  it('fails when the status is already set', async () => {
    await comments.save(
      commentAnemic('c-1', { status: CommentStatus.APPROVED }),
    );

    const result = await useCase.execute({
      id: ID,
      status: CommentStatus.APPROVED,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('fails when the comment does not exist', async () => {
    const result = await useCase.execute({
      id: ID,
      status: CommentStatus.SPAM,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
