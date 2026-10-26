import type { HelixChatChatter } from '@twurple/api';
import type { Chatter } from '@toxictoast/twitch-bot-domain';

export const chatterFromHelix = (chatter: HelixChatChatter): Chatter => {
  return {
    user_id: chatter.userId,
    user_login: chatter.userName,
    user_name: chatter.userDisplayName,
  };
};
