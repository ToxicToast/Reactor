import type { Optional } from '@toxictoast/shared-types';

export interface ScheduledJob {
  readonly name: string;
  /** Env-Variable mit dem Cron-Muster */
  readonly patternEnv: string;
  readonly defaultPattern: string;
  readonly attempts?: Optional<number>;
}
