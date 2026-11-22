import type { Optional } from '@toxictoast/shared-types';
import type { ReadinessProbesProvider } from './readiness-probes-provider.interface.js';

export interface HealthModuleOptions {
  readonly database: boolean;
  /** Setzt RedisModule voraus. */
  readonly redis?: Optional<boolean>;
  readonly replay?: Optional<boolean>;
  readonly probes?: Optional<ReadinessProbesProvider>;
}
