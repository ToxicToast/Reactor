import { optionalEnv } from '@toxictoast/shared-system';
import {
  TWITCH_STATS_DEFAULTS,
  type TwitchStatsConfig,
} from '@toxictoast/twitch-application';

const ENV = 'TWITCH_STATS_TIME_ZONE';

export const twitchStatsConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): TwitchStatsConfig => {
  const timeZone =
    optionalEnv(ENV, undefined, source) ?? TWITCH_STATS_DEFAULTS.TIME_ZONE;
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
  } catch {
    throw new Error(`${ENV} must be an IANA time zone, got ${timeZone}`);
  }
  return { time_zone: timeZone };
};
