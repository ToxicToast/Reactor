import { TIME_MS } from '@toxictoast/shared-types';

export const retentionCutoff = (now: Date, retentionDays: number): Date => {
  return new Date(now.getTime() - retentionDays * TIME_MS.DAY);
};
