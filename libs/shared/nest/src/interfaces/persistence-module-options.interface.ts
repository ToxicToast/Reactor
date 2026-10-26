import type { Optional } from '@toxictoast/shared-types';

export interface PersistenceModuleOptions {
  readonly outbox?: Optional<boolean>;
}
