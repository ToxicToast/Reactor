import type { AccountMetrics } from '../types/index.js';
import type { AccountRef } from './account-ref.interface.js';

export interface AccountSnapshot {
  readonly account: AccountRef;
  readonly observed_at: Date;
  readonly metrics: AccountMetrics;
}
