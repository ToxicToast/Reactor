import type { Nullable } from '@toxictoast/shared-types';
import type { StreamSessionAnemic } from '../anemics/index.js';
import { secondsBetween } from './seconds-between.function.js';

export const watchSeconds = (
  joinedAt: Date,
  leftAt: Date,
  session: Nullable<Pick<StreamSessionAnemic, 'started_at' | 'ended_at'>>,
): number => {
  if (!session) {
    return 0;
  }
  return secondsBetween(
    Math.max(joinedAt.getTime(), session.started_at.getTime()),
    Math.min(leftAt.getTime(), (session.ended_at ?? leftAt).getTime()),
  );
};
