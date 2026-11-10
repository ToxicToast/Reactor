import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const MediaEvents = defineDomainEvents('blog.media', 2, {
  CREATED: 'created',
  UPDATED: 'updated',
  UPLOAD_CONFIRMED: 'upload_confirmed',
  DELETED: 'deleted',
  RESTORED: 'restored',
});
