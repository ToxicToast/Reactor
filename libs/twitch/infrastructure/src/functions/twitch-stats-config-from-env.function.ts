import { optionalEnv } from '@toxictoast/shared-system';
import {
  TWITCH_STATS_DEFAULTS,
  type TwitchStatsConfig,
} from '@toxictoast/twitch-application';
import { TWITCH_ENV } from '../constants/index.js';

export const twitchStatsConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): TwitchStatsConfig => {
  const timeZone =
    optionalEnv(TWITCH_ENV.STATS_TIME_ZONE, undefined, source) ??
    TWITCH_STATS_DEFAULTS.TIME_ZONE;
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
  } catch {
    throw new Error(
      `${TWITCH_ENV.STATS_TIME_ZONE} must be an IANA time zone, got ${timeZone}`,
    );
  }
  return { time_zone: timeZone };
};
