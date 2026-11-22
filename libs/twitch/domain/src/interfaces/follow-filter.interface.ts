import type { Nullable } from '@toxictoast/shared-types';
import type { FollowState } from '../types/index.js';

export interface FollowFilter {
  readonly channel_id: string;
  readonly user_id: Nullable<string>;
  readonly state: FollowState;
}
