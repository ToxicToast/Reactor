import {
  CommentModerator,
  CommentStatus,
  type AuthorId,
  type CommentAnemic,
  type CommentId,
  type PostId,
} from '@toxictoast/blog-domain';
import { CommentMapper } from './comment.mapper.js';

const ANEMIC: CommentAnemic = {
  id: 'c-2' as CommentId,
  post_id: 'post-1' as PostId,
  parent_id: 'c-1' as CommentId,
  author_id: 'author-1' as AuthorId,
  content: 'Für den Imperator!',
  status: CommentStatus.APPROVED,
  moderation_note: 'passt',
  moderated_by: CommentModerator.AI,
  moderated_at: new Date('2026-10-20T10:01:00Z'),
  created_at: new Date('2026-10-20T10:00:00Z'),
  updated_at: new Date('2026-10-20T10:01:00Z'),
  deleted_at: null,
};

describe('CommentMapper', () => {
  const mapper = new CommentMapper();

  it('maps to a row and back without losing data', () => {
    expect(mapper.toAnemic(mapper.toRow(ANEMIC))).toEqual(ANEMIC);
  });

  it('keeps an unmoderated comment without moderation data', () => {
    const pending: CommentAnemic = {
      ...ANEMIC,
      parent_id: null,
      status: CommentStatus.PENDING,
      moderation_note: null,
      moderated_by: null,
      moderated_at: null,
    };

    expect(mapper.toAnemic(mapper.toRow(pending))).toEqual(pending);
  });
});
