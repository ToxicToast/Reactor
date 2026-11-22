import type { IpBanPayloadV1 } from '@toxictoast/contracts-events';

export type BanPayload = Pick<
  IpBanPayloadV1,
  'id' | 'ip' | 'banned_until' | 'lifted_at'
>;
