import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const CommentEvents = defineDomainEvents('blog.comment', 2, {
  CREATED: 'created',
  UPDATED: 'updated',
  APPROVED: 'approved',
  MARKED_AS_SPAM: 'marked_as_spam',
  MARKED_AS_HATE: 'marked_as_hate',
  MARKED_FOR_REVIEW: 'marked_for_review',
  DELETED: 'deleted',
  RESTORED: 'restored',
});
