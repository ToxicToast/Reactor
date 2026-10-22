import type { Anemic } from './anemic.interface.js';

export interface Domain<TAnemic extends Anemic> {
  toAnemic(): TAnemic;
}
