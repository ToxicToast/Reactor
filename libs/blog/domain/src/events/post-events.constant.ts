import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const PostEvents = defineDomainEvents('blog.post', 2, {
  CREATED: 'created',
  UPDATED: 'updated',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  UNARCHIVED: 'unarchived',
  DELETED: 'deleted',
  RESTORED: 'restored',
});
