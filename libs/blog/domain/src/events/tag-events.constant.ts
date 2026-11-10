import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const TagEvents = defineDomainEvents('blog.tag', 2, {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  RESTORED: 'restored',
});
