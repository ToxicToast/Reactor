import { defineDomainEvents } from '@toxictoast/shared-kernel';

export const TwitchFriendEvents = defineDomainEvents('twitch.bot', 1, {
  ADDED: 'friend_added',
  REMOVED: 'friend_removed',
});
