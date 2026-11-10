import { TWITCH_DISCORD } from '../constants/index.js';

export const twitchChannelUrl = (login: string): string => {
  return `${TWITCH_DISCORD.BASE_URL}/${login}`;
};
