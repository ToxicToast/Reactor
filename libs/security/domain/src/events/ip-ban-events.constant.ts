import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const IpBanEvents = defineDomainEvents('security.ip', 1, {
  BANNED: 'banned',
  UNBANNED: 'unbanned',
});
