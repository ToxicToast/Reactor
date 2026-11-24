import type { SessionStatus } from '../interfaces/index.js';

export const averageViewers = (status: SessionStatus): number => {
  if (status.viewer_samples === 0) {
    return 0;
  }
  return Math.round(status.viewer_sum / status.viewer_samples);
};
