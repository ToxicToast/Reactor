import type { DomainContext } from '@toxictoast/shared-kernel';
import type { CommentData } from '../data/index.js';
import { CommentModerator, CommentStatus } from '../enums/index.js';
import { CommentFactory } from '../factories/index.js';
import type { AuthorId, CommentId, PostId } from '../types/index.js';
import type { CommentDomain } from './comment.domain.js';

const NOW = new Date('2026-10-19T12:00:00Z');

const ctx: DomainContext = {
  id: { generate: () => 'id-1' as never },
  date: { now: () => NOW },
};

const VALID_DATA: CommentData = {
  post_id: 'post-1' as PostId,
  parent_id: null,
  author_id: 'author-1' as AuthorId,
  content: 'Für den Imperator!',
};

describe('CommentDomain', () => {
  const factory = new CommentFactory(ctx);

  const createComment = (data: Partial<CommentData> = {}): CommentDomain => {
    const result = factory.createDomain({ ...VALID_DATA, ...data });
    if (result.isFailure) {
      throw result.error;
    }
    const comment = result.value;
    comment.toEvents();
    return comment;
  };

  describe('createDomain', () => {
    it('creates a pending comment without moderation and CreateCommentEvent', () => {
      const result = factory.createDomain(VALID_DATA);

      expect(result.isSuccess).toBe(true);
      expect(result.value.isPending).toBe(true);
      expect(result.value.toAnemic()).toMatchObject({
        status: CommentStatus.PENDING,
        moderation_note: null,
        moderated_by: null,
        moderated_at: null,
      });
      expect(result.value.toEvents().map((e) => e.event_name)).toEqual([
        'create',
      ]);
    });

    it('creates a reply with parent', () => {
      const parentId = 'comment-0' as CommentId;

      const comment = createComment({ parent_id: parentId });

      expect(comment.toAnemic().parent_id).toBe(parentId);
    });

    it('trims the content', () => {
      const comment = createComment({ content: '  Für den Imperator!  ' });

      expect(comment.toAnemic().content).toBe('Für den Imperator!');
    });

    it.each([
      ['empty content', { content: '   ' }],
      ['content too long', { content: 'a'.repeat(5001) }],
    ])('fails on %s', (_, data) => {
      const result = factory.createDomain({ ...VALID_DATA, ...data });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });
  });

  describe('updateContent', () => {
    it('updates and trims the content', () => {
      const comment = createComment();

      const result = comment.updateContent('  Ketzerei!  ');

      expect(result.isSuccess).toBe(true);
      expect(comment.toAnemic()).toMatchObject({
        content: 'Ketzerei!',
        updated_at: NOW,
      });
      expect(comment.toEvents().map((e) => e.event_name)).toEqual(['update']);
    });

    it('keeps the moderation status', () => {
      const comment = createComment();
      comment.approveComment(CommentModerator.ADMIN);

      comment.updateContent('Geändert');

      expect(comment.toAnemic().status).toBe(CommentStatus.APPROVED);
    });

    it('raises no event when nothing changes', () => {
      const comment = createComment();

      comment.updateContent(VALID_DATA.content);

      expect(comment.toEvents()).toHaveLength(0);
    });

    it('fails on empty content', () => {
      const comment = createComment();

      const result = comment.updateContent('   ');

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });

    it('refuses to update a deleted comment', () => {
      const comment = createComment();
      comment.deleteComment();

      const result = comment.updateContent('Neu');

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('moderation', () => {
    it.each([
      [
        'approveComment',
        CommentStatus.APPROVED,
        'approve',
        (c: CommentDomain) =>
          c.approveComment(CommentModerator.AI, 'Unbedenklich'),
      ],
      [
        'markAsSpam',
        CommentStatus.SPAM,
        'spam',
        (c: CommentDomain) => c.markAsSpam(CommentModerator.AI, 'Werbelink'),
      ],
      [
        'markAsHate',
        CommentStatus.HATE,
        'hate',
        (c: CommentDomain) => c.markAsHate(CommentModerator.AI, 'Beleidigung'),
      ],
    ])('%s sets status, moderator and note', (_, status, eventName, act) => {
      const comment = createComment();

      const result = act(comment);

      expect(result.isSuccess).toBe(true);
      expect(comment.toAnemic()).toMatchObject({
        status,
        moderated_by: CommentModerator.AI,
        moderated_at: NOW,
        updated_at: NOW,
      });
      expect(comment.toAnemic().moderation_note).not.toBeNull();
      expect(comment.toEvents().map((e) => e.event_name)).toEqual([eventName]);
    });

    it('marks the comment as no longer pending', () => {
      const comment = createComment();

      comment.approveComment(CommentModerator.AI);

      expect(comment.isPending).toBe(false);
      expect(comment.isApproved).toBe(true);
    });

    it('stores no note when none is given', () => {
      const comment = createComment();

      comment.markAsSpam(CommentModerator.ADMIN);

      expect(comment.toAnemic().moderation_note).toBeNull();
    });

    it('trims the note and turns an empty note into null', () => {
      const trimmed = createComment();
      const empty = createComment();

      trimmed.markAsHate(CommentModerator.AI, '  Beleidigung  ');
      empty.markAsHate(CommentModerator.AI, '   ');

      expect(trimmed.toAnemic().moderation_note).toBe('Beleidigung');
      expect(empty.toAnemic().moderation_note).toBeNull();
    });

    it('lets an admin correct an AI decision', () => {
      const comment = createComment();
      comment.markAsSpam(CommentModerator.AI, 'Werbelink');
      comment.toEvents();

      const result = comment.approveComment(CommentModerator.ADMIN);

      expect(result.isSuccess).toBe(true);
      expect(comment.toAnemic()).toMatchObject({
        status: CommentStatus.APPROVED,
        moderated_by: CommentModerator.ADMIN,
        moderation_note: null,
      });
      expect(comment.toEvents().map((e) => e.event_name)).toEqual(['approve']);
    });

    it('can hide an approved comment later', () => {
      const comment = createComment();
      comment.approveComment(CommentModerator.AI);

      const result = comment.markAsHate(CommentModerator.ADMIN);

      expect(result.isSuccess).toBe(true);
      expect(comment.toAnemic().status).toBe(CommentStatus.HATE);
    });

    it('refuses the same status twice', () => {
      const comment = createComment();
      comment.markAsSpam(CommentModerator.AI);

      const result = comment.markAsSpam(CommentModerator.ADMIN);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
      expect(comment.toAnemic().moderated_by).toBe(CommentModerator.AI);
    });

    it('refuses to moderate a deleted comment', () => {
      const comment = createComment();
      comment.deleteComment();

      const result = comment.approveComment(CommentModerator.AI);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
      expect(comment.isPending).toBe(true);
    });
  });

  describe('deleteComment / restoreComment', () => {
    it('soft-deletes and restores the comment', () => {
      const comment = createComment();

      comment.deleteComment();
      expect(comment.toAnemic().deleted_at).toEqual(NOW);

      comment.restoreComment();
      expect(comment.toAnemic().deleted_at).toBeNull();

      expect(comment.toEvents().map((e) => e.event_name)).toEqual([
        'delete',
        'restore',
      ]);
    });

    it('keeps the moderation status through delete and restore', () => {
      const comment = createComment();
      comment.markAsHate(CommentModerator.AI);

      comment.deleteComment();
      comment.restoreComment();

      expect(comment.toAnemic().status).toBe(CommentStatus.HATE);
    });
  });
});
