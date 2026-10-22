import type { Anemic, DomainEvent } from '@toxictoast/shared-kernel';

export interface PersistableDomain<TAnemic extends Anemic> {
  toAnemic(): TAnemic;
  toEvents(): Array<DomainEvent>;
}
