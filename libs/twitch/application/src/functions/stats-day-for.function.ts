import type { Nullable } from '@toxictoast/shared-types';
import {
  statsDayOf,
  type StreamSessionAnemic,
} from '@toxictoast/twitch-domain';

export const statsDayFor = (
  occurredAt: Date,
  session: Nullable<Pick<StreamSessionAnemic, 'started_at'>>,
  timeZone: string,
): string => {
  return statsDayOf(session?.started_at ?? occurredAt, timeZone);
};
