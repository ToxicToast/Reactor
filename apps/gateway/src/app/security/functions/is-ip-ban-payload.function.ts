import type { IpBanPayloadV1 } from '@toxictoast/contracts-events';

export const isIpBanPayload = (
  payload: unknown,
): payload is Pick<
  IpBanPayloadV1,
  'id' | 'ip' | 'banned_until' | 'lifted_at'
> => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const value = payload as Record<string, unknown>;
  return (
    typeof value['id'] === 'string' &&
    typeof value['ip'] === 'string' &&
    typeof value['banned_until'] === 'string' &&
    (value['lifted_at'] === null || typeof value['lifted_at'] === 'string')
  );
};
