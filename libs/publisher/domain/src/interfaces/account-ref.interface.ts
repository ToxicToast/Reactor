import type { Platform } from '../types/index.js';

export interface AccountRef {
  readonly platform: Platform;
  readonly remote_id: string;
}
