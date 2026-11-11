import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const StreamSessionEvents = defineDomainEvents('twitch.session', 1, {
  STARTED: 'started',
  ENDED: 'ended',
});
