import type { Optional } from '@toxictoast/shared-types';

export interface ReadinessResult {
  readonly up: boolean;
  readonly details?: Optional<Record<string, unknown>>;
}
