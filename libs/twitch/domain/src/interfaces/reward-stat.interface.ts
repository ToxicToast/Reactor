import type { RewardRef } from './reward-ref.interface.js';

export interface RewardStat extends RewardRef {
  readonly redemptions: number;
  readonly points_spent: number;
}
