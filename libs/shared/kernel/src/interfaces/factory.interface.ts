import type { Anemic } from './anemic.interface.js';
import type { Domain } from './domain.interface.js';
import { Result } from '../classes/index.js';

export interface Factory<
  TAnemic extends Anemic,
  TDomain extends Domain<TAnemic>,
  TCreate,
> {
  reconstitute(anemic: TAnemic): TDomain;
  constitute(domain: TDomain): TAnemic;
  createDomain(data: TCreate): Result<TDomain>;
}
