import {
  CommentFactory,
  CommentModerator,
  CommentStatus,
} from '@toxictoast/blog-domain';
import {
  commentAnemic,
  createTestContext,
  TEST_NOW,
} from '../testing/index.js';
import type { ModerationStatus } from '../types/index.js';
import { CommentModerationService } from './comment-moderation.service.js';

describe('CommentModerationService', () => {
  const factory = new CommentFactory(createTestContext());
  const service = new CommentModerationService();

  it.each<ModerationStatus>([
    CommentStatus.APPROVED,
    CommentStatus.SPAM,
    CommentStatus.HATE,
  ])('sets the status to %s', (status) => {
    const comment = factory.reconstitute(commentAnemic('c-1'));

    const result = service.moderate(
      comment,
      status,
      CommentModerator.ADMIN,
      ' Notiz ',
    );

    expect(result.isSuccess).toBe(true);
    expect(comment.toAnemic()).toMatchObject({
      status,
      moderated_by: CommentModerator.ADMIN,
      moderated_at: TEST_NOW,
      moderation_note: 'Notiz',
    });
  });

  it('fails when the status does not change', () => {
    const comment = factory.reconstitute(
      commentAnemic('c-1', { status: CommentStatus.SPAM }),
    );

    const result = service.moderate(
      comment,
      CommentStatus.SPAM,
      CommentModerator.AI,
      null,
    );

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });
});
