import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const YouTubeChannelEvents = defineDomainEvents('youtube.channel', 1, {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  REVOKED: 'revoked',
});
