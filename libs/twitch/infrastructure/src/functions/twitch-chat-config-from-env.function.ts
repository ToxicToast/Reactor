import { numberEnv } from '@toxictoast/shared-system';
import {
  CHAT_LOG,
  type TwitchChatConfig,
} from '@toxictoast/twitch-application';
import { TWITCH_ENV } from '../constants/index.js';

export const twitchChatConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): TwitchChatConfig => {
  const retentionDays = numberEnv(
    TWITCH_ENV.CHAT_RETENTION_DAYS,
    CHAT_LOG.DEFAULT_RETENTION_DAYS,
    source,
  );
  if (!Number.isInteger(retentionDays) || retentionDays < 1) {
    throw new Error(
      `${TWITCH_ENV.CHAT_RETENTION_DAYS} must be a whole number of days, got ${retentionDays}`,
    );
  }
  return { retention_days: retentionDays };
};
