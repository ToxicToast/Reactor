import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const CommentModerationEvents = defineDomainEvents(
  'blog.comment.moderation',
  1,
  {
    REQUESTED: 'requested',
  },
);
