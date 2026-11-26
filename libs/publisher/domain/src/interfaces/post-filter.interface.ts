import type { Nullable } from '@toxictoast/shared-types';
import type { Platform } from '../types/index.js';

export interface PostFilter {
  readonly platform: Nullable<Platform>;
  readonly account_remote_id: Nullable<string>;
}
