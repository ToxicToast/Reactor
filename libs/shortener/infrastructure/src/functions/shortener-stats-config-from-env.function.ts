import { timeZoneEnv } from '@toxictoast/shared-system';
import {
  LINK_STATS,
  type ShortenerStatsConfig,
} from '@toxictoast/shortener-application';
import { SHORTENER_ENV } from '../constants/index.js';

export const shortenerStatsConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): ShortenerStatsConfig => {
  return {
    time_zone: timeZoneEnv(
      SHORTENER_ENV.STATS_TIME_ZONE,
      LINK_STATS.TIME_ZONE,
      source,
    ),
  };
};
