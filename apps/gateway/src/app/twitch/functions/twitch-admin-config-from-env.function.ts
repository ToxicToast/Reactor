import { requiredEnv } from '@toxictoast/shared-system';
import type { TwitchAdminConfig } from '../interfaces/index.js';

export const twitchAdminConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): TwitchAdminConfig => {
  return {
    redirectUri: requiredEnv('TWITCH_REDIRECT_URI', source),
  };
};
