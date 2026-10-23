import type { BlogCommentPayloadV1 } from '@toxictoast/contracts-events';
import { isUuid } from '@toxictoast/shared-kernel';

export const isModerationRequestedPayload = (
  payload: unknown,
): payload is Pick<BlogCommentPayloadV1, 'id' | 'content' | 'deleted_at'> => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const value = payload as Record<string, unknown>;
  return (
    isUuid(value['id']) &&
    typeof value['content'] === 'string' &&
    (value['deleted_at'] === null || typeof value['deleted_at'] === 'string')
  );
};
