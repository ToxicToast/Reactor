import type { AccessDeniedPayloadV1 } from '@toxictoast/contracts-events';

export const isAccessDeniedPayload = (
  payload: unknown,
): payload is Pick<AccessDeniedPayloadV1, 'ip' | 'status_code'> => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const value = payload as Record<string, unknown>;
  return (
    typeof value['ip'] === 'string' && typeof value['status_code'] === 'number'
  );
};
