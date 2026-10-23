import type { ModerationDecidedPayloadV1 } from '@toxictoast/contracts-events';
import { DECISIONS } from '../constants/index.js';

export const isModerationDecidedPayload = (
  payload: unknown,
): payload is Pick<
  ModerationDecidedPayloadV1,
  'comment_id' | 'decision' | 'note'
> => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const value = payload as Record<string, unknown>;
  return (
    typeof value['comment_id'] === 'string' &&
    typeof value['decision'] === 'string' &&
    DECISIONS.has(value['decision']) &&
    (value['note'] === null || typeof value['note'] === 'string')
  );
};
