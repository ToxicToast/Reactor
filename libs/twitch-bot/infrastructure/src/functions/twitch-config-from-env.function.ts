import { requiredEnv } from '@toxictoast/shared-system';
import type { TwitchConfig } from '../interfaces/index.js';

export const twitchConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): TwitchConfig => {
  return {
    clientId: requiredEnv('TWITCH_CLIENT_ID', source),
    clientSecret: requiredEnv('TWITCH_CLIENT_SECRET', source),
  };
};
