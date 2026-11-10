import type { Anemic, Result } from '@toxictoast/shared-kernel';

export interface AggregateChange<TAnemic extends Anemic, TDomain> {
  (
    domain: TDomain,
    anemic: TAnemic,
  ): Result<void> | void | Promise<Result<void> | void>;
}
