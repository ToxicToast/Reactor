import {
  CommentStatus,
  type AuthorId,
  type CommentAnemic,
  type CommentId,
  type PostId,
} from '@toxictoast/blog-domain';
import { TEST_NOW } from './test-domain-context.js';

export const commentAnemic = (
  id: string,
  overrides: Partial<CommentAnemic> = {},
): CommentAnemic => {
  return {
    id: id as CommentId,
    post_id: 'post-1' as PostId,
    parent_id: null,
    author_id: 'author-1' as AuthorId,
    content: 'Für den Imperator!',
    status: CommentStatus.PENDING,
    moderation_note: null,
    moderated_by: null,
    moderated_at: null,
    created_at: TEST_NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
