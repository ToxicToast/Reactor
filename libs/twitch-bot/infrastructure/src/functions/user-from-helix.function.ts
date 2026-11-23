import type { TwitchUser } from '@toxictoast/twitch-bot-application';
import type { HelixUser } from '@twurple/api';

export const userFromHelix = (user: HelixUser): TwitchUser => {
  return {
    twitch_id: user.id,
    login: user.name,
    display_name: user.displayName,
  };
};
