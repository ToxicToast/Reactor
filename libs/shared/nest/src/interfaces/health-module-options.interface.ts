import type { Optional } from '@toxictoast/shared-types';

export interface HealthModuleOptions {
  readonly database: boolean;
  readonly replay?: Optional<boolean>;
}
