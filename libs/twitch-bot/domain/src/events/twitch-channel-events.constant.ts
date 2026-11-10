import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const TwitchChannelEvents = defineDomainEvents('twitch.bot', 1, {
  CONNECTED: 'channel_connected',
  DISCONNECTED: 'channel_disconnected',
  REVOKED: 'channel_revoked',
});
