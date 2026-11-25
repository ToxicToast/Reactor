import { statsDayOf } from '@toxictoast/shared-kernel';
import type { DayRange, StatsRange } from '@toxictoast/twitch-domain';

export const dayRangeOf = (range: StatsRange, timeZone: string): DayRange => {
  return {
    from: range.from === null ? null : statsDayOf(range.from, timeZone),
    to: range.to === null ? null : statsDayOf(range.to, timeZone),
  };
};
