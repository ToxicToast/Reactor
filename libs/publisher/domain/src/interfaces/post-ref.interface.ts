import type { Platform } from '../types/index.js';

export interface PostRef {
  readonly platform: Platform;
  readonly remote_id: string;
}
