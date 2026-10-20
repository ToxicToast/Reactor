import { randomUUID } from 'node:crypto';
import {
  ApplyModerationDecisionUseCase,
  CommentModerationService,
  commentAnemic,
  InMemoryCommentRepository,
} from '@toxictoast/blog-application';
import {
  CommentFactory,
  CommentModerator,
  CommentStatus,
  type CommentId,
} from '@toxictoast/blog-domain';
import {
  createUuidTestContext,
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { ModerationDecidedHandler } from './moderation-decided.handler.js';

const NOW = new Date('2026-10-20T12:00:00Z');
const COMMENT = randomUUID();

const payload = (overrides: Record<string, unknown> = {}) => {
  return {
    subject_type: 'blog.comment',
    subject_id: COMMENT,
    decision: 'spam',
    note: 'link farm',
    ...overrides,
  };
};

describe('ModerationDecidedHandler', () => {
  let comments: InMemoryCommentRepository;
  let handler: ModerationDecidedHandler;

  beforeEach(async () => {
    comments = new InMemoryCommentRepository();
    handler = new ModerationDecidedHandler(
      new ApplyModerationDecisionUseCase(
        new CommentFactory(createUuidTestContext(NOW)),
        comments,
        new CommentModerationService(),
        new DomainPersistence(new InMemoryOutbox(), new ImmediateUnitOfWork()),
      ),
    );
    await comments.save(commentAnemic(COMMENT));
  });

  const stored = () => comments.items.get(COMMENT as CommentId);

  it('applies the decision of the AI to the comment', async () => {
    await handler.handle(payload());

    expect(stored()).toMatchObject({
      status: CommentStatus.SPAM,
      moderated_by: CommentModerator.AI,
      moderation_note: 'link farm',
    });
  });

  it('keeps the comment pending on review', async () => {
    await handler.handle(payload({ decision: 'review', note: null }));

    expect(stored()?.status).toBe(CommentStatus.PENDING);
  });

  it.each([
    ['another subject type', payload({ subject_type: 'twitch.message' })],
    ['an invalid payload', { decision: 'spam' }],
    ['an unknown decision', payload({ decision: 'nope' })],
    ['an invalid comment id', payload({ subject_id: 'abc' })],
  ])('ignores %s', async (_, value) => {
    await handler.handle(value);

    expect(stored()?.status).toBe(CommentStatus.PENDING);
  });

  it('does not throw for a comment that no longer exists', async () => {
    await expect(
      handler.handle(payload({ subject_id: randomUUID() })),
    ).resolves.toBeUndefined();
  });

  it('lets infrastructure errors through so the consumer retries', async () => {
    jest.spyOn(comments, 'findById').mockRejectedValue(new Error('db down'));

    await expect(handler.handle(payload())).rejects.toThrow('db down');
  });
});
