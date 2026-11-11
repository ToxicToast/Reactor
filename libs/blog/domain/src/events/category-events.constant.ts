import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const CategoryEvents = defineDomainEvents('blog.category', 2, {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  RESTORED: 'restored',
});
