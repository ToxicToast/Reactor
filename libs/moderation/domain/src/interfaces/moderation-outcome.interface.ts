import type { Nullable } from '@toxictoast/shared-types';
import type { ModerationDecision } from '../enums/index.js';

export interface ModerationOutcome {
  readonly decision: ModerationDecision;
  readonly note: Nullable<string>;
}
