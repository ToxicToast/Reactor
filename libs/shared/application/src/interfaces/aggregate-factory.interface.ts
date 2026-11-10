import type { Anemic } from '@toxictoast/shared-kernel';

export interface AggregateFactory<TAnemic extends Anemic, TDomain> {
  reconstitute(anemic: TAnemic): TDomain;
}
