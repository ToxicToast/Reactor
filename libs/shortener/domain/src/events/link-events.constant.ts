import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const LinkEvents = defineDomainEvents('shortener.link', 1, {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  RESTORED: 'restored',
});
