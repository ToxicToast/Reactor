import type { Nullable } from '@toxictoast/shared-types';
import type { BlogModerationDecision } from '../constants/index.js';

export interface ModerationDecidedPayloadV1 {
  readonly comment_id: string;
  readonly decision: (typeof BlogModerationDecision)[keyof typeof BlogModerationDecision];
  readonly note: Nullable<string>;
}
