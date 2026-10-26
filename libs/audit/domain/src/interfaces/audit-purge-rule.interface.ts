import type { Optional } from '@toxictoast/shared-types';

export interface AuditPurgeRule {
  readonly before: Date;
  readonly include?: Optional<ReadonlyArray<string>>;
  readonly exclude?: Optional<ReadonlyArray<string>>;
}
