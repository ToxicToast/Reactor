import { requiredEnv } from '@toxictoast/shared-system';
import { TWITCH_ADMIN_ENV } from '../constants/index.js';
import type { TwitchAdminConfig } from '../interfaces/index.js';

export const twitchAdminConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): TwitchAdminConfig => {
  return {
    redirectUri: requiredEnv(TWITCH_ADMIN_ENV.REDIRECT_URI, source),
  };
};
