import { TWITCH_DISCORD } from '../constants/twitch-discord.constant.js';

export const subTierName = (tier: string): string => {
  return TWITCH_DISCORD.SUB_TIERS[tier] ?? tier;
};
