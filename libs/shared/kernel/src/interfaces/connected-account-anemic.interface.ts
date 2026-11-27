import type { Id } from '../types/index.js';
import type { Anemic } from './anemic.interface.js';

/** ein per OAuth verbundenes Plattform-Konto */
export interface ConnectedAccountAnemic<
  TId extends Id<string> = Id<string>,
> extends Anemic<TId> {
  readonly scopes: ReadonlyArray<string>;
  readonly connected: boolean;
}
