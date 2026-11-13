import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const WebhookEvents = defineDomainEvents('webhook', 1, {
  CREATED: 'created',
  UPDATED: 'updated',
  SECRET_ROTATED: 'secret_rotated',
  DELETED: 'deleted',
});
