import type { Optional } from '@toxictoast/shared-types';
import { TWITCH_STATS_DEFAULTS } from '../constants/index.js';

export const clampLimit = (limit: Optional<number>): number => {
  return Math.min(
    Math.max(limit ?? TWITCH_STATS_DEFAULTS.LIMIT, 1),
    TWITCH_STATS_DEFAULTS.MAX_LIMIT,
  );
};
