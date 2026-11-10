import type { Nullable } from '@toxictoast/shared-types';
import type { PollChoice } from './poll-choice.interface.js';

export interface PollSnapshot {
  readonly poll_id: string;
  readonly title: string;
  readonly choices: ReadonlyArray<PollChoice>;
  readonly status: string;
  readonly started_at: Date;
  readonly ends_at: Nullable<Date>;
  readonly ended_at: Nullable<Date>;
}
