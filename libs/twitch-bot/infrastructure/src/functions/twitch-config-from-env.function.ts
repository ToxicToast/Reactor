import { requiredEnv } from '@toxictoast/shared-system';
import { TWITCH_APP_ENV } from '../constants/index.js';
import type { TwitchConfig } from '../interfaces/index.js';

export const twitchConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): TwitchConfig => {
  return {
    clientId: requiredEnv(TWITCH_APP_ENV.CLIENT_ID, source),
    clientSecret: requiredEnv(TWITCH_APP_ENV.CLIENT_SECRET, source),
  };
};
