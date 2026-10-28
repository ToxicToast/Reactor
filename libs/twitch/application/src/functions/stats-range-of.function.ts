import type { Optional } from '@toxictoast/shared-types';
import type { StatsRange } from '@toxictoast/twitch-domain';

export const statsRangeOf = (query: {
  readonly from?: Optional<Date>;
  readonly to?: Optional<Date>;
}): StatsRange => {
  return { from: query.from ?? null, to: query.to ?? null };
};
