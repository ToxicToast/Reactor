import type { Nullable } from '@toxictoast/shared-types';
import type { StatsRange } from './stats-range.interface.js';

export interface ChatMessageFilter extends StatsRange {
  readonly channel_id: string;
  readonly user_id: Nullable<string>;
  readonly session_id: Nullable<string>;
  readonly query: Nullable<string>;
  readonly include_deleted: boolean;
}
