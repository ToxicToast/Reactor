import type { IpBanAnemic } from '../anemics/index.js';

export type IpBanData = Pick<
  IpBanAnemic,
  'ip' | 'level' | 'failed_attempts' | 'banned_until'
>;
