import { Retentions } from '../constants/index.js';

export const retentionCutoff = (now: Date, retentionDays: number): Date => {
  return new Date(now.getTime() - retentionDays * Retentions.CUTOFF);
};
