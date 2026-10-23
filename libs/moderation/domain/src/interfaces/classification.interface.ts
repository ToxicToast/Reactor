import type { Verdict } from '../enums/index.js';

export interface Classification {
  readonly verdict: Verdict;
  readonly confidence: number;
  readonly reason: string;
}
