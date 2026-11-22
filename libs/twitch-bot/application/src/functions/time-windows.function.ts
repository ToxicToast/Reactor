import { TIME_MS } from '@toxictoast/shared-types';
import type { TimeWindow } from '../interfaces/index.js';

export const timeWindows = (
  from: Date,
  to: Date,
  days: number,
): Array<TimeWindow> => {
  const step = days * TIME_MS.DAY;
  const windows: Array<TimeWindow> = [];
  for (let start = from.getTime(); start < to.getTime(); start += step) {
    windows.push({
      since: new Date(start),
      until: new Date(Math.min(start + step, to.getTime())),
    });
  }
  return windows;
};
