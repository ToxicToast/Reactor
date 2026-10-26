import type { Optional } from '@toxictoast/shared-types';

export interface MetricsModuleOptions {
  readonly outbox: boolean;
  readonly consumer?: Optional<boolean>;
}
