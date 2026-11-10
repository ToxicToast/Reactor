import { createFixedTestContext } from '@toxictoast/shared-kernel/testing';
import type { CommentData } from '../data/index.js';
import { CommentModerator, CommentStatus } from '../enums/index.js';
import { CommentFactory } from '../factories/index.js';
import type { AuthorId, ModerationStatus, PostId } from '../types/index.js';
import type { CommentDomain } from './comment.domain.js';

const NOW = new Date('2026-11-06T12:00:00Z');

const DATA: CommentData = {
  post_id: 'post-1' as PostId,
  parent_id: null,
  author_id: 'author-1' as AuthorId,
  content: 'Für den Imperator!',
};

describe('CommentDomain moderation', () => {
  const factory = new CommentFactory(
    createFixedTestContext('comment-1', () => NOW),
  );

  const pending = (): CommentDomain => {
    const result = factory.createDomain(DATA);
    if (result.isFailure) {
      throw result.error;
    }
    result.value.toEvents();
    return result.value;
  };

  describe('moderate', () => {
    it.each<ModerationStatus>([
      CommentStatus.APPROVED,
      CommentStatus.SPAM,
      CommentStatus.HATE,
    ])('sets the status to %s', (status) => {
      const comment = pending();

      const result = comment.moderate(
        status,
        CommentModerator.ADMIN,
        ' Notiz ',
      );

      expect(result.isSuccess).toBe(true);
      expect(comment.toAnemic()).toMatchObject({
        status,
        moderated_by: CommentModerator.ADMIN,
        moderated_at: NOW,
        moderation_note: 'Notiz',
      });
    });

    it('fails when the status does not change', () => {
      const comment = pending();
      comment.moderate(CommentStatus.SPAM, CommentModerator.AI);

      const result = comment.moderate(CommentStatus.SPAM, CommentModerator.AI);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('applyDecision', () => {
    it('applies a final decision', () => {
      const comment = pending();

      const result = comment.applyDecision(
        CommentStatus.SPAM,
        CommentModerator.AI,
        'link farm',
      );

      expect(result.isSuccess).toBe(true);
      expect(comment.toAnemic()).toMatchObject({
        status: CommentStatus.SPAM,
        moderated_by: CommentModerator.AI,
        moderation_note: 'link farm',
      });
    });

    it('marks the comment for review on an undecided result', () => {
      const comment = pending();

      const result = comment.applyDecision(
        CommentStatus.PENDING,
        CommentModerator.AI,
        'unsure',
      );

      expect(result.isSuccess).toBe(true);
      expect(comment.toAnemic()).toMatchObject({
        status: CommentStatus.PENDING,
        moderated_by: CommentModerator.AI,
        moderation_note: 'unsure',
      });
    });

    it('ignores decisions for already moderated comments', () => {
      const comment = pending();
      comment.moderate(CommentStatus.APPROVED, CommentModerator.ADMIN);
      comment.toEvents();

      const result = comment.applyDecision(
        CommentStatus.SPAM,
        CommentModerator.AI,
      );

      expect(result.isSuccess).toBe(true);
      expect(comment.toAnemic().status).toBe(CommentStatus.APPROVED);
      expect(comment.toEvents()).toHaveLength(0);
    });

    it('ignores decisions for deleted comments', () => {
      const comment = pending();
      comment.deleteComment();
      comment.toEvents();

      const result = comment.applyDecision(
        CommentStatus.SPAM,
        CommentModerator.AI,
      );

      expect(result.isSuccess).toBe(true);
      expect(comment.toAnemic().status).toBe(CommentStatus.PENDING);
      expect(comment.toEvents()).toHaveLength(0);
    });
  });
});
