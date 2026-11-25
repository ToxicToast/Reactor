import { timeZoneEnv } from '@toxictoast/shared-system';
import {
  TWITCH_STATS_DEFAULTS,
  type TwitchStatsConfig,
} from '@toxictoast/twitch-application';
import { TWITCH_ENV } from '../constants/index.js';

export const twitchStatsConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): TwitchStatsConfig => {
  return {
    time_zone: timeZoneEnv(
      TWITCH_ENV.STATS_TIME_ZONE,
      TWITCH_STATS_DEFAULTS.TIME_ZONE,
      source,
    ),
  };
};
