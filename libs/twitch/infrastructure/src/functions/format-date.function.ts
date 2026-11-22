import { DISCORD_DATE } from '../constants/discord-date.constant.js';

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString(DISCORD_DATE.LOCALE, {
    dateStyle: 'long',
    timeZone: DISCORD_DATE.TIME_ZONE,
  });
};
