import type { DayRange, StatsRange } from '@toxictoast/twitch-domain';

export const isWithinDayRange = (day: string, range: DayRange): boolean => {
  return (
    (range.from === null || day >= range.from) &&
    (range.to === null || day <= range.to)
  );
};

export const isWithinStatsRange = (date: Date, range: StatsRange): boolean => {
  return (
    (range.from === null || date >= range.from) &&
    (range.to === null || date <= range.to)
  );
};

export const compositeKey = (...parts: ReadonlyArray<string>): string => {
  return parts.join('|');
};
