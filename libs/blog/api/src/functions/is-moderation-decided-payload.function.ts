import type { ModerationDecidedPayloadV1 } from '@toxictoast/contracts-events';
import { DECISIONS } from '../constants';

export const isModerationDecidedPayload = (
  payload: unknown,
): payload is ModerationDecidedPayloadV1 => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const value = payload as Record<string, unknown>;
  return (
    typeof value['subject_type'] === 'string' &&
    typeof value['subject_id'] === 'string' &&
    typeof value['decision'] === 'string' &&
    DECISIONS.has(value['decision']) &&
    (value['note'] === null || typeof value['note'] === 'string')
  );
};
