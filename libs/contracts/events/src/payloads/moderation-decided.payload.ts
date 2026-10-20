import type { Nullable } from '@toxictoast/shared-types';

export interface ModerationDecidedPayloadV1 {
  readonly subject_type: string;
  readonly subject_id: string;
  readonly decision: 'approved' | 'spam' | 'hate' | 'review';
  readonly note: Nullable<string>;
}
